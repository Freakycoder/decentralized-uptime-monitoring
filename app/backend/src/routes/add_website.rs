use crate::{entities::{website_register, validator, notification}, middleware::auth::jwt_auth_middleware, types::websocket::ServerMessage};
use crate::types::redis::AppState;
use axum::{
    extract::State, middleware, routing:: post, Json, Router
};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use crate::types::website::{AddWebsiteInput, AddWebsiteResponse};


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
            println!("Website saved to database with id {}",website_details.id);
            
            // Get all validators from database
            let validators = validator::Entity::find().all(&db).await;
            
            match validators {
                Ok(validator_list) => {
                    println!("Found {} validators, creating notification entries...", validator_list.len());
                    
                    // Create notification entries for all validators
                    for validator in validator_list {
                        let notification_entry = notification::ActiveModel {
                            validator_id: Set(validator.id),
                            title: Set("New Website to Monitor".to_string()),
                            message: Set(format!("Monitor {}", url)),
                            website_url: Set(url.clone()),
                            website_id: Set(website_details.id.to_string()),
                            read: Set(false),
                            action_taken: Set(None),
                            notification_type: Set("monitoring".to_string()),
                            ..Default::default()
                        };
                        
                        if let Err(e) = notification_entry.insert(&db).await {
                            println!("Error creating notification for validator {}: {}", validator.id, e);
                        }
                    }
                    
                    println!("Created notification entries for all validators");
                }
                Err(e) => {
                    println!("Error fetching validators: {}", e);
                }
            }
            
            println!("Publishing notifciation to validators via redis pubsub...");

            let server_message = ServerMessage { url: url.clone(), id: website_details.id.to_string() };

            match state.pubsub.publish_to_validators(server_message).await{
                Ok(_) => {
                    println!("Sucessfully published website through server");
                    return Json(AddWebsiteResponse {
                        status_code: 200,
                        message: format!("New URL registered successfully, notifications created in DB, and real-time notifications sent to validators"),
                    });
                },
                Err(e) => {
                    println!("Error in publishing website through server {}",e);
                    Json(AddWebsiteResponse {
                        status_code: 207, // Multi-Status: partial success
                        message: format!(
                            "Website '{}' was registered and notifications created in DB, but failed to send real-time notifications: {}",
                            url, e
                        ),
                    })
                }
            }
            
        }
        Err(db_err) => {
            return Json(AddWebsiteResponse {
                status_code: 404,
                message: format!("Db error occured : {}", db_err),
            });
        }
    }
}