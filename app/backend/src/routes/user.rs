use crate::entities::validator;
use crate::types::cookie::CookieAppState;
use crate::types::user::{LoginResponse, SessionStatusResponse, UserData};
use crate::utils::cookie_extractor::get_authenticated_user_id;
use crate::{
    entities::user,
    types::user::{SignUpResponse, UserInput},
};
use axum::{
    extract::{Json, State},
    routing::{get, post},
    Router,
};
use axum_extra::extract::cookie::CookieJar;
use cookie::Cookie;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use tower_cookies::Cookies; // Cookies is an extractor like JSON or State.

pub fn user_router() -> Router<CookieAppState> {
    Router::new()
        .route("/signup", post(signup))
        .route("/signin", post(signin))
        .route("/session-status", get(check_session_status))
}
#[axum::debug_handler]
async fn signup(
    State(app_state): State<CookieAppState>,
    cookies: CookieJar,
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
            let session_id = match app_state.session_store.create_session(user.id).await {
                Ok(id) => id,
                Err(_) => {
                    println!("failed to create session for user");
                    return Json(SignUpResponse {
                        message: format!("failed creating a session for the user"),
                        status_code: 404,
                        user_id: None,
                    });
                }
            };

            let session_cookie = Cookie::build(("session_id", session_id))
                .http_only(true)
                .secure(false) // Use HTTPS in production
                .same_site(cookie::SameSite::Lax)
                .max_age(cookie::time::Duration::seconds(7200)) // Match session expiration
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
    cookies: CookieJar,
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
        let session_id = if let Some(session_id) = cookies.get("session_id") {
            let existing_session_id = session_id.value();
            if let Some(session_data) = app_state
                .session_store
                .get_session(existing_session_id)
                .await
            {
                if session_data.user_id == existing_user.id {
                    println!("✅ Reusing existing valid session: {}", existing_session_id);
                    existing_session_id.to_string()
                } else {
                    println!("🔄 Session belongs to different user, creating new session");
                    match app_state
                        .session_store
                        .create_session(existing_user.id)
                        .await
                    {
                        Ok(id) => id,
                        Err(e) => {
                            println!("Error creating session for logged in user: {}", e);
                            return Json(LoginResponse {
                                status_code: 404,
                                message: format!("error creating sesion"),
                                user_data: None,
                            });
                        }
                    }
                }
            } else {
                println!("Session expired or invalid, creating new session...");
                match app_state
                    .session_store
                    .create_session(existing_user.id)
                    .await
                {
                    Ok(id) => id,
                    Err(e) => {
                        println!("Error creating session for logged in user: {}", e);
                        return Json(LoginResponse {
                            status_code: 404,
                            message: format!("error creating sesion"),
                            user_data: None,
                        });
                    }
                }
            }
        } else {
            println!("No exisiting session cookie found, creating new cookie");
            match app_state
                .session_store
                .create_session(existing_user.id)
                .await
            {
                Ok(id) => id,
                Err(e) => {
                    println!("Error creating session for logged in user: {}", e);
                    return Json(LoginResponse {
                        status_code: 404,
                        message: format!("error creating sesion"),
                        user_data: None,
                    });
                }
            }
        };

        let session_cookie = Cookie::build(("session_id", session_id))
            .http_only(true)
            .secure(false)
            .same_site(cookie::SameSite::Lax)
            .max_age(cookie::time::Duration::seconds(7200))
            .path("/")
            .build();
        cookies.add(session_cookie);

        let validator_info: Option<validator::Model> = validator::Entity::find()
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

#[axum::debug_handler]
async fn check_session_status(
    State(app_state): State<CookieAppState>,
    cookies: CookieJar,
) -> Json<SessionStatusResponse> {
    match get_authenticated_user_id(&cookies, &app_state.session_store).await {
        Ok(user_id) => {
            println!("✅ Found valid session for user: {} from server", user_id);
            let user_result = user::Entity::find_by_id(user_id).one(&app_state.db).await;

            match user_result {
                Ok(Some(user)) => {
                    let validator_info = validator::Entity::find()
                        .filter(validator::Column::UserId.eq(user_id))
                        .one(&app_state.db)
                        .await
                        .unwrap_or(None);

                    Json(SessionStatusResponse {
                        status_code: 200,
                        is_valid: true,
                        user_id: Some(user.id.to_string()),
                        validator_id: validator_info.map(|v| v.id.to_string()),
                    })
                }
                _ => Json(SessionStatusResponse {
                    status_code: 401,
                    is_valid: false,
                    user_id: None,
                    validator_id: None,
                }),
            }
        }
        Err(_) => {
            println!("❌ No valid session found from server");
            Json(SessionStatusResponse {
                status_code: 401,
                is_valid: false,
                user_id: None,
                validator_id: None,
            })
        }
    }
}

pub fn create_hash(unhashed_pass: String) -> String {
    let hashed_pass = bcrypt::hash(unhashed_pass, bcrypt::DEFAULT_COST).unwrap_or_default();
    hashed_pass
}
