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
    response::{IntoResponse},
    routing::{get, post},
    Router,
};
use axum_extra::extract::cookie::{Cookie, CookieJar}; // ✅ Use CookieJar from axum_extra
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};

pub fn user_router() -> Router<CookieAppState> {
    Router::new()
        .route("/signup", post(signup))
        .route("/signin", post(signin))
        .route("/session-status", get(check_session_status))
}

#[axum::debug_handler]
async fn signup(
    State(app_state): State<CookieAppState>,
    jar: CookieJar, // ✅ Use CookieJar
    Json(user_data): Json<UserInput>,
) -> impl IntoResponse {
    let email = user_data.email;
    let password = user_data.password;

    println!("🔄 Signup attempt for email: {}", email);

    let old_user = user::Entity::find()
        .filter(user::Column::Email.eq(&email))
        .one(&app_state.db)
        .await;

    if let Err(db_err) = old_user {
        println!("Some issue occurred with finding old user.");
        return (
            jar,
            Json(SignUpResponse {
                status_code: 500,
                message: format!("Database error occurred : {}", db_err),
                user_id: None,
            }),
        );
    }

    if let Some(_) = old_user.unwrap() {
        println!("user already exist");
        return (
            jar,
            Json(SignUpResponse {
                status_code: 409,
                message: format!("User already exist, please SignIn"),
                user_id: None,
            }),
        );
    }

    let new_user = user::ActiveModel {
        email: Set(email),
        password_hash: Set(create_hash(password)),
        ..Default::default()
    };
    println!("creating new user record.");

    match new_user.insert(&app_state.db).await {
        Ok(user) => {
            let session_id = match app_state.session_store.create_session(user.id).await {
                Ok(id) => id,
                Err(e) => {
                    println!("❌ Failed to create session for user: {}", e);
                    return (
                        jar,
                        Json(SignUpResponse {
                            message: format!("failed creating a session for the user"),
                            status_code: 500,
                            user_id: None,
                        }),
                    );
                }
            };

            println!("🍪 Setting signup session cookie: {}", session_id);

            let session_cookie = Cookie::build(("session_id", session_id))
                .http_only(true)
                .secure(false)
                .same_site(cookie::SameSite::None)
                .max_age(cookie::time::Duration::seconds(7200))
                .path("/")
                .build();

            println!("🍪 Cookie details: {:?}", session_cookie);

            let updated_jar = jar.add(session_cookie);
            println!("✅ Cookie added to jar");

            (
                updated_jar,
                Json(SignUpResponse {
                    message: user.id.to_string(),
                    status_code: 200,
                    user_id: Some(user.id.to_string()),
                }),
            )
        }

        Err(err) => (
            jar,
            Json(SignUpResponse {
                status_code: 500,
                message: format!("Failed to create new user : {}", err),
                user_id: None,
            }),
        ),
    }
}

#[axum::debug_handler]
async fn signin(
    State(app_state): State<CookieAppState>,
    jar: CookieJar, // ✅ Use CookieJar
    Json(user_data): Json<UserInput>,
) -> impl IntoResponse {
    let email = user_data.email;
    let db = app_state.db.clone();

    println!("🔄 Signin attempt for email: {}", email);

    let old_user = user::Entity::find()
        .filter(user::Column::Email.eq(&email))
        .one(&db)
        .await;

    if let Err(db_err) = old_user {
        return (
            jar,
            Json(LoginResponse {
                status_code: 500,
                message: format!("Database error occurred : {}", db_err),
                user_data: None,
            }),
        );
    }

    if let Some(existing_user) = old_user.unwrap() {
        println!("✅ User found: {}", existing_user.id);

        let session_id = if let Some(session_cookie) = jar.get("session_id") {
            let existing_session_id = session_cookie.value();
            println!("🔍 Found existing session cookie: {}", existing_session_id);
            
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
                            println!("❌ Error creating session for logged in user: {}", e);
                            return (
                                jar,
                                Json(LoginResponse {
                                    status_code: 500,
                                    message: format!("error creating session"),
                                    user_data: None,
                                }),
                            );
                        }
                    }
                }
            } else {
                println!("🔄 Session expired or invalid, creating new session...");
                match app_state
                    .session_store
                    .create_session(existing_user.id)
                    .await
                {
                    Ok(id) => id,
                    Err(e) => {
                        println!("❌ Error creating session for logged in user: {}", e);
                        return (
                            jar,
                            Json(LoginResponse {
                                status_code: 500,
                                message: format!("error creating session"),
                                user_data: None,
                            }),
                        );
                    }
                }
            }
        } else {
            println!("🔄 No existing session cookie found, creating new session");
            match app_state
                .session_store
                .create_session(existing_user.id)
                .await
            {
                Ok(id) => id,
                Err(e) => {
                    println!("❌ Error creating session for logged in user: {}", e);
                    return (
                        jar,
                        Json(LoginResponse {
                            status_code: 500,
                            message: format!("error creating session"),
                            user_data: None,
                        }),
                    );
                }
            }
        };

        println!("🍪 Setting login session cookie: {}", session_id);

        let session_cookie = Cookie::build(("session_id", session_id))
            .http_only(true)
            .secure(false)
            .same_site(cookie::SameSite::None)
            .max_age(cookie::time::Duration::seconds(7200))
            .path("/")
            .build();

        println!("🍪 Cookie details: {:?}", session_cookie);

        let updated_jar = jar.add(session_cookie);
        println!("✅ Cookie added to jar");

        let validator_info: Option<validator::Model> = validator::Entity::find()
            .filter(validator::Column::UserId.eq(existing_user.id))
            .one(&app_state.db)
            .await
            .unwrap_or(None);

        let validator_id = match validator_info {
            Some(data) => {
                println!("✅ User has validator: {}", data.id);
                Some(data.id)
            },
            None => {
                println!("ℹ️ User is not a validator");
                None
            }
        };

        let response = Json(LoginResponse {
            status_code: 200,
            message: if validator_id.is_some() { 
                format!("User found with validator_id") 
            } else { 
                format!("User found") 
            },
            user_data: Some(UserData {
                user_id: existing_user.id,
                validator_id,
            }),
        });

        println!("📤 Sending login response");
        return (updated_jar, response);
    } else {
        println!("❌ User not found for email: {}", email);
        return (
            jar,
            Json(LoginResponse {
                status_code: 404,
                message: format!("User not found"),
                user_data: None,
            }),
        );
    }
}

#[axum::debug_handler]
async fn check_session_status(
    State(app_state): State<CookieAppState>,
    jar: CookieJar,
) -> Json<SessionStatusResponse> {
    println!("🔍 === SESSION STATUS CHECK STARTED ===");
    
    match get_authenticated_user_id(&jar, &app_state.session_store).await {
        Ok(user_id) => {
            println!("✅ Found valid session for user: {} from server", user_id);
            let user_result = user::Entity::find_by_id(user_id).one(&app_state.db).await;

            match user_result {
                Ok(Some(user)) => {
                    println!("✅ User found in database: {}", user.id);
                    
                    let validator_info = validator::Entity::find()
                        .filter(validator::Column::UserId.eq(user_id))
                        .one(&app_state.db)
                        .await
                        .unwrap_or(None);

                    match &validator_info {
                        Some(validator) => {
                            println!("✅ Validator found: {}", validator.id);
                        }
                        None => {
                            println!("ℹ️ User is not a validator");
                        }
                    }

                    let response = SessionStatusResponse {
                        status_code: 200,
                        is_valid: true,
                        user_id: Some(user.id.to_string()),
                        validator_id: validator_info.map(|v| v.id.to_string()),
                    };
                    
                    println!("📤 Sending successful session response: {:?}", response);
                    Json(response)
                }
                Ok(None) => {
                    println!("❌ User not found in database for ID: {}", user_id);
                    Json(SessionStatusResponse {
                        status_code: 401,
                        is_valid: false,
                        user_id: None,
                        validator_id: None,
                    })
                }
                Err(db_err) => {
                    println!("❌ Database error: {}", db_err);
                    Json(SessionStatusResponse {
                        status_code: 401,
                        is_valid: false,
                        user_id: None,
                        validator_id: None,
                    })
                }
            }
        }
        Err(status_code) => {
            println!("❌ No valid session found from server - Status: {:?}", status_code);
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