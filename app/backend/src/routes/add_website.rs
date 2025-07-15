use crate::{entities::website_register, middleware::auth::jwt_auth_middleware, types::websocket::ServerMessage};
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
            println!("Website saved to database with id {}",website_details.id);
            
            println!("Publishing notifciation to validators via redis pubsub...");

            let server_message = ServerMessage { url: url, id: website_details.id.to_string() };

            match state.pubsub.publish_to_validators(server_message).await{
                Ok(_) => {
                    println!("Sucessfully published website through server");
                },
                Err(e) => {
                    println!("Error in publishing website through server {}",e)
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