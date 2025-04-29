use std::str::FromStr;

use crate::entities::validator;
use crate::types::user::{ValidatorInput, VerifySignatureRequest, VerifyValidatorResponse};
use axum::extract::State;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::{Json, Router, debug_handler, routing::post};
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set};
use solana_sdk::{pubkey::Pubkey, signature::Signature};

pub fn validator_router() -> Router<DatabaseConnection> {
    Router::new()
        .route("/wallet", post(handle_connection))
        .route("/verify-validator", post(verify_validator))
}

#[debug_handler]
async fn verify_validator(
    State(db): State<DatabaseConnection>,
    Json(validator_data): Json<ValidatorInput>,
) -> Json<VerifyValidatorResponse> {
    let user_id = validator_data.user_id;
    let device_id = validator_data.device_id;
    let proximity_range = 0.001;

    let old_validator = validator::Entity::find()
        .filter(validator::Column::DeviceId.eq(&device_id))
        .filter(validator::Column::Latitude.gte(validator_data.latitude - proximity_range))
        .filter(validator::Column::Latitude.lte(validator_data.latitude + proximity_range))
        .filter(validator::Column::Longitude.gte(validator_data.longitude - proximity_range))
        .filter(validator::Column::Longitude.gte(validator_data.longitude + proximity_range))
        .one(&db)
        .await;

    if let Err(db_err) = old_validator {
        return Json(VerifyValidatorResponse {
            status_code: 500,
            message: format!("Database error occured : {}", db_err),
        });
    }

    if let Some(_) = old_validator.unwrap() {
        return Json(VerifyValidatorResponse {
            status_code: 201,
            message: format!("A validator exist from same Device"),
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

    match new_validator.insert(&db).await {
        Ok(validator) => {
            return Json(VerifyValidatorResponse {
                status_code: 201,
                message: format!("New validator registered : {}", validator.id),
            });
        }
        Err(db_err) => {
            return Json(VerifyValidatorResponse {
                status_code: 500,
                message: format!("Db error occured : {}", db_err),
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
