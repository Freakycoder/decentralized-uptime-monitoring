use crate::entities::validator;
use crate::middleware::auth::jwt_auth_middleware;
use crate::types::cookie::CookieAppState;
use crate::types::user::{
    ValidatorData, ValidatorInput, VerifySignatureRequest, VerifyValidatorResponse,
};
use crate::utils::jwt_extractor::create_jwt;
use axum::extract::State;
use axum::http::StatusCode;
use axum::middleware;
use axum::response::IntoResponse;
use axum::{debug_handler, extract::Extension, routing::post, Json, Router};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use solana_sdk::{pubkey::Pubkey, signature::Signature};
use std::str::FromStr;
use uuid::Uuid;

pub fn validator_router() -> Router<CookieAppState> {
    Router::new()
        .route("/wallet", post(handle_connection))
        .route(
            "/verify-validator",
            post(verify_validator).layer(middleware::from_fn(jwt_auth_middleware)))
}

#[debug_handler]
async fn verify_validator(
    State(app_state): State<CookieAppState>,
    Extension(user_id): Extension<Uuid>,
    Json(validator_data): Json<ValidatorInput>,
) -> Json<VerifyValidatorResponse> {
    let device_id = validator_data.device_id;
    let proximity_range = 0.001;

    let old_validator = validator::Entity::find()
        .filter(validator::Column::DeviceId.eq(&device_id))
        .filter(validator::Column::Latitude.gte(validator_data.latitude - proximity_range))
        .filter(validator::Column::Latitude.lte(validator_data.latitude + proximity_range))
        .filter(validator::Column::Longitude.gte(validator_data.longitude - proximity_range))
        .filter(validator::Column::Longitude.gte(validator_data.longitude + proximity_range))
        .one(&app_state.db)
        .await;

    if let Err(db_err) = old_validator {
        return Json(VerifyValidatorResponse {
            status_code: 500,
            message: format!("Database error occured : {}", db_err),
            validator_data: None,
            token: None,
        });
    }

    if let Some(_) = old_validator.unwrap() {
        return Json(VerifyValidatorResponse {
            status_code: 201,
            message: format!("A validator exist from same Device"),
            validator_data: None,
            token: None,
        });
    }

    let new_validator = validator::ActiveModel {
        user_id: Set(user_id),
        wallet_address: Set(validator_data.wallet_address),
        latitude: Set(Some(validator_data.latitude)),
        longitude: Set(Some(validator_data.longitude)),
        device_id: Set(device_id),
        ..Default::default()
    };

    match new_validator.insert(&app_state.db).await {
        Ok(validator) => {
            println!("✅ New validator registered: {}", validator.id);
            
            // Create new JWT token with user_id and validator_id
            let new_token = match create_jwt(user_id, Some(validator.id)) {
                Ok(token) => Some(token),
                Err(e) => {
                    println!("❌ Failed to create JWT for validator: {}", e);
                    return Json(VerifyValidatorResponse {
                        status_code: 500,
                        message: format!("Failed to create updated JWT token"),
                        validator_data: None,
                        token: None,
                    });
                }
            };

            println!("🔑 Created new JWT with validator_id for user: {}", user_id);

            return Json(VerifyValidatorResponse {
                status_code: 201,
                message: format!("New validator registered : {}", validator.id),
                validator_data: Some(ValidatorData {
                    validator_id: validator.id,
                    latitude: validator_data.latitude,
                    longitude: validator_data.longitude,
                }),
                token: new_token,
            });
        }
        Err(db_err) => {
            return Json(VerifyValidatorResponse {
                status_code: 500,
                message: format!("Db error occured : {}", db_err),
                validator_data: None,
                token: None,
            });
        }
    }
}

#[debug_handler]
async fn handle_connection(
    Json(verification_data): Json<VerifySignatureRequest>,
) -> impl IntoResponse {
    let pubkey_bytes = match Pubkey::from_str(&verification_data.public_key) {
        // here base58 encoded publickey is decoded into bytes (Vec of Bytes).
        Ok(pk) => pk,
        Err(parse_error) => {
            return (
                StatusCode::BAD_REQUEST,
                format!("could not parse due to {}", parse_error),
            )
                .into_response();
        }
    };

    let signature_bytes = match Signature::from_str(&verification_data.signature) {
        Ok(sig) => sig,
        Err(parse_error) => {
            return (
                StatusCode::BAD_REQUEST,
                format!("could not parse due to {}", parse_error),
            )
                .into_response();
        }
    };

    let message_bytes = verification_data.message.into_bytes();

    let is_valid = signature_bytes.verify(pubkey_bytes.as_ref(), &message_bytes);
    Json(is_valid).into_response()
}
