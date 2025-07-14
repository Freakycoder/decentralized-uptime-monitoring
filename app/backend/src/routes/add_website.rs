use crate::{entities::{website_register, validator, notification}, middleware::auth::jwt_auth_middleware};
use crate::types::redis::AppState;
use axum::{
    extract::State, middleware, routing:: post, Json, Router
};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use crate::types::website::{AddWebsiteInput, AddWebsiteResponse};
use uuid::Uuid;
use chrono::Utc;

pub fn add_website_router() -> Router<AppState> {
    Router::new().route("/add", post(website_to_add)).layer(middleware::from_fn(jwt_auth_middleware))
}

#[axum::debug_handler]
async fn website_to_add(
    State(state): State<AppState>, // state represents globally shared data in rust. it is done bcoz we cannot pass db and ws twice using State()
    Json(website_data): Json<AddWebsiteInput>,
) -> Json<AddWebsiteResponse> {


    let url = website_data.url_to_monitor;
    let user_id  = website_data.user_id;
    let db = state.db;
    let ws = state.ws;

    let existing_url = website_register::Entity::find()
        .filter(website_register::Column::WebsiteUrl.eq(&url))
        .one(&db)
        .await;

    if let Err(db_err) = existing_url {
        return Json(AddWebsiteResponse {
            status_code: 500,
            message: format!("db error occured : {}", db_err),
        });
    }

    if let Some(_) = existing_url.unwrap() {
        return Json(AddWebsiteResponse {
            status_code: 409,
            message: format!("website already exist"),
        });
    }

    let new_url = website_register::ActiveModel {
        website_url: Set(url.clone()),
        user_id : Set(user_id),
        ..Default::default()
    };

    let result = new_url.insert(&db).await;

    match result {
        Ok(website_details) => {
            // Send WebSocket broadcast to connected validators
            ws.website_to_broadcast(url.clone(), website_details.id);
            
            // Create notifications for all validators
            let validators_result = validator::Entity::find().all(&db).await;
            
            match validators_result {
                Ok(validators) => {
                    let validator_count = validators.len();
                    
                    // Create a notification for each validator
                    for validator in validators {
                        let notification = notification::ActiveModel {
                            id: Set(Uuid::new_v4()),
                            validator_id: Set(validator.id),
                            title: Set("New Website Monitoring Task".to_string()),
                            message: Set(format!("A new website '{}' has been added for monitoring. Accept this task to start earning SOL tokens.", url)),
                            created_at: Set(Utc::now().timestamp().to_string()),
                            website_url: Set(url.clone()),
                            website_id: Set(website_details.id.to_string()),
                            read: Set(false),
                            action_taken: Set(None),
                            notification_type: Set("monitoring".to_string()),
                        };
                        
                        // Insert the notification (ignore individual failures to avoid blocking)
                        let _ = notification.insert(&db).await;
                    }
                    
                    println!("✅ Created notifications for {} validators", validator_count);
                }
                Err(validator_err) => {
                    println!("⚠️ Warning: Could not fetch validators for notification creation: {}", validator_err);
                    // Continue anyway - WebSocket notifications still work
                }
            }
            
            return Json(AddWebsiteResponse {
                status_code: 200,
                message: format!("New URL registered successfully and notifications sent to validators"),
            });
        }
        Err(db_err) => {
            return Json(AddWebsiteResponse {
                status_code: 404,
                message: format!("Db error occured : {}", db_err),
            });
        }
    }
}