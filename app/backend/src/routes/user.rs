use crate::entities::validator;
use crate::types::cookie::CookieAppState;
use crate::types::user::{LoginResponse, UserData};
use crate::{
    entities::user,
    types::user::{SignUpResponse, UserInput},
};
use axum::{
    extract::{Json, State},
    routing::post,
    Router,
};
use cookie::Cookie;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use tower_cookies::Cookies; // Cookies is an extractor like JSON or State.

pub fn user_router() -> Router<CookieAppState> {
    Router::new()
        .route("/signup", post(signup))
        .route("/signin", post(signin))
}
#[axum::debug_handler]
async fn signup(
    State(app_state): State<CookieAppState>,
    cookies: Cookies,
    Json(user_data): Json<UserInput>,
) -> Json<SignUpResponse> {
    let email = user_data.email;
    let password = user_data.password;

    let old_user = user::Entity::find()
        .filter(user::Column::Email.eq(&email))
        .one(&app_state.db)
        .await;

    if let Err(db_err) = old_user {
        println!("Some issue occured with finding old user.");
        return Json(SignUpResponse {
            status_code: 500,
            message: format!("Database error occured : {}", db_err),
            user_id: None,
        });
    }

    if let Some(_) = old_user.unwrap() {
        println!("user already exist");
        return Json(SignUpResponse {
            status_code: 409, //conflict status code
            message: format!("User already exist, please SignIn"),
            user_id: None,
        });
    }

    let new_user = user::ActiveModel {
        email: Set(email),
        password_hash: Set(create_hash(password)),
        ..Default::default()
    }; // this part is just creating a record to insert into db
    println!("creating new user record.");

    match new_user.insert(&app_state.db).await {
        // in 'new_user.insert(&db).await' we actually insert the record into db
        Ok(user) => {
            let session_id = app_state.session_store.create_session(user.id).await;

            let session_cookie = Cookie::build(("session_id", session_id))
                .http_only(true)
                .secure(true) // Use HTTPS in production
                .same_site(cookie::SameSite::Strict)
                .max_age(cookie::time::Duration::hours(24)) // Match session expiration
                .path("/")
                .build();

            cookies.add(session_cookie);

            Json(SignUpResponse {
                message: user.id.to_string(),
                status_code: 200,
                user_id: Some(user.id.to_string()),
            })
        }

        Err(err) => Json(SignUpResponse {
            status_code: 404,
            message: format!("Failed to create new user : {}", err),
            user_id: None,
        }),
    }
}

async fn signin(
    State(app_state): State<CookieAppState>,
    cookies: Cookies,
    Json(user_data): Json<UserInput>,
) -> Json<LoginResponse> {
    let email = user_data.email;
    let db = app_state.db.clone();

    let old_user = user::Entity::find()
        .filter(user::Column::Email.eq(&email))
        .one(&db)
        .await;

    if let Err(db_err) = old_user {
        return Json(LoginResponse {
            status_code: 500,
            message: format!("Database error occured : {}", db_err),
            user_data: None,
        });
    }

    if let Some(existing_user) = old_user.unwrap() {
        let session_id = app_state
            .session_store
            .create_session(existing_user.id)
            .await;

        let session_cookie = Cookie::build(("session_id", session_id))
            .http_only(true)
            .secure(true)
            .same_site(cookie::SameSite::Strict)
            .max_age(cookie::time::Duration::hours(2))
            .path("/")
            .build();
        cookies.add(session_cookie);

        let validator_info = validator::Entity::find()
            .filter(validator::Column::UserId.eq(existing_user.id))
            .one(&app_state.db)
            .await
            .unwrap_or(None);

        let validator_id = match validator_info {
            Some(data) => data.id,
            None => {
                return Json(LoginResponse {
                    status_code: 200,
                    message: format!("User found"),
                    user_data: Some(UserData {
                        user_id: existing_user.id,
                        validator_id: None,
                    }),
                })
            }
        };

        return Json(LoginResponse {
            status_code: 200,
            message: format!("User found with validator_id"),
            user_data: Some(UserData {
                user_id: existing_user.id,
                validator_id: Some(validator_id),
            }),
        });
    } else {
        return Json(LoginResponse {
            status_code: 404,
            message: format!("User not found"),
            user_data: None,
        });
    }
}

pub fn create_hash(unhashed_pass: String) -> String {
    let hashed_pass = bcrypt::hash(unhashed_pass, bcrypt::DEFAULT_COST).unwrap_or_default();
    hashed_pass
}
