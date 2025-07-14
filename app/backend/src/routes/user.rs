use crate::entities::validator;
use crate::types::redis::AppState;
use crate::types::user::{LoginResponse, UserData};
use crate::utils::jwt_extractor::{create_jwt};
use crate::{
    entities::user,
    types::user::{SignUpResponse, UserInput},
};
use axum::{
    extract::{Json, State},
    routing::{post},
    Router,
};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};

pub fn user_router() -> Router<AppState> {
    Router::new()
        .route("/signup", post(signup))
        .route("/signin", post(signin))
}

#[axum::debug_handler]
async fn signup(
    State(app_state): State<AppState>,
    Json(user_data): Json<UserInput>,
) -> Json<SignUpResponse> {
    let email = user_data.email;
    let password = user_data.password;

    println!("🔄 Signup attempt for email: {}", email);

    let old_user = user::Entity::find()
        .filter(user::Column::Email.eq(&email))
        .one(&app_state.db)
        .await;

    if let Err(db_err) = old_user {
        println!("Some issue occurred with finding old user.");
        return Json(SignUpResponse {
            status_code: 500,
            message: format!("Database error occurred : {}", db_err),
            user_id: None,
            token: None,
        });
    }

    if let Some(_) = old_user.unwrap() {
        println!("user already exist");
        return Json(SignUpResponse {
            status_code: 409,
            message: format!("User already exist, please SignIn"),
            user_id: None,
            token: None,
        });
    }

    let new_user = user::ActiveModel {
        email: Set(email),
        password_hash: Set(create_hash(password)),
        ..Default::default()
    };
    println!("creating new user record.");

    match new_user.insert(&app_state.db).await {
        Ok(user) => {
            // TODO: Redis session creation temporarily disabled
            // let _session_id = match app_state.session_store.create_session(user.id).await {
            //     Ok(id) => id,
            //     Err(e) => {
            //         println!("❌ Failed to create session for user: {}", e);
            //         return Json(SignUpResponse {
            //             message: format!("failed creating a session for the user"),
            //             status_code: 500,
            //             user_id: None,
            //             token: None,
            //         });
            //     }
            // };

            println!("✅ User created successfully, skipping session creation");

            // Create JWT token
            let token = match create_jwt(user.id, None) {
                Ok(jwt) => jwt,
                Err(e) => {
                    println!("❌ Failed to create JWT for user: {}", e);
                    return Json(SignUpResponse {
                        message: format!("failed creating JWT token"),
                        status_code: 500,
                        user_id: None,
                        token: None,
                    });
                }
            };

            println!("✅ Created JWT for user: {}", user.id);

            Json(SignUpResponse {
                message: user.id.to_string(),
                status_code: 200,
                user_id: Some(user.id.to_string()),
                token: Some(token),
            })
        }

        Err(err) => Json(SignUpResponse {
            status_code: 500,
            message: format!("Failed to create new user : {}", err),
            user_id: None,
            token: None,
        }),
    }
}

#[axum::debug_handler]
async fn signin(
    State(app_state): State<AppState>,
    Json(user_data): Json<UserInput>,
) -> Json<LoginResponse> {
    let email = user_data.email;
    let db = app_state.db.clone();

    println!("🔄 Signin attempt for email: {}", email);

    let old_user = user::Entity::find()
        .filter(user::Column::Email.eq(&email))
        .one(&db)
        .await;

    if let Err(db_err) = old_user {
        return Json(LoginResponse {
            status_code: 500,
            message: format!("Database error occurred : {}", db_err),
            user_data: None,
            token: None,
        });
    }

    if let Some(existing_user) = old_user.unwrap() {
        println!("✅ User found: {}", existing_user.id);
        let validator_info: Option<validator::Model> = validator::Entity::find()
            .filter(validator::Column::UserId.eq(existing_user.id))
            .one(&app_state.db)
            .await
            .unwrap_or(None);

        let validator_id = match validator_info {
            Some(data) => {
                println!("✅ User has validator: {}", data.id);
                Some(data.id)
            }
            None => {
                println!("ℹ️ User is not a validator");
                None
            }
        };

        // Create JWT token with validator_id if present
        let token = match create_jwt(existing_user.id, validator_id) {
            Ok(jwt) => Some(jwt),
            Err(e) => {
                println!("❌ Failed to create JWT for user: {}", e);
                return Json(LoginResponse {
                    status_code: 500,
                    message: format!("Failed to create JWT token"),
                    user_data: None,
                    token: None,
                });
            }
        };

        return Json(LoginResponse {
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
            token,
        });
    } else {
        println!("❌ User not found for email: {}", email);
        return Json(LoginResponse {
            status_code: 404,
            message: format!("User not found"),
            user_data: None,
            token: None,
        });
    }
}

// #[axum::debug_handler]
// async fn check_session_status(
//     State(app_state): State<CookieAppState>,
//     headers: HeaderMap,
// ) -> Json<SessionStatusResponse> {
//     println!("🔍 === SESSION STATUS CHECK STARTED ===");

//     let authenticated_user = match extract_jwt_from_headers(&headers) {
//         Ok(user) => user,
//         Err(_) => {
//             return Json(SessionStatusResponse {
//                 status_code: 401,
//                 is_valid: false,
//                 user_id: None,
//                 validator_id: None,
//             });
//         }
//     };

//     let user_id = authenticated_user.user_id;
//     println!("✅ Found valid JWT for user: {} from server", user_id);
//     let user_result = user::Entity::find_by_id(user_id).one(&app_state.db).await;

//     match user_result {
//         Ok(Some(user)) => {
//             println!("✅ User found in database: {}", user.id);

//             // Use validator_id from JWT if available, otherwise query database
//             let validator_id = if let Some(vid) = authenticated_user.validator_id {
//                 Some(vid)
//             } else {
//                 let validator_info = validator::Entity::find()
//                     .filter(validator::Column::UserId.eq(user_id))
//                     .one(&app_state.db)
//                     .await
//                     .unwrap_or(None);
//                 validator_info.map(|v| v.id)
//             };

//             match &validator_id {
//                 Some(validator) => {
//                     println!("✅ Validator found: {}", validator);
//                 }
//                 None => {
//                     println!("ℹ️ User is not a validator");
//                 }
//             }

//             let response = SessionStatusResponse {
//                 status_code: 200,
//                 is_valid: true,
//                 user_id: Some(user.id.to_string()),
//                 validator_id: validator_id.map(|v| v.to_string()),
//             };

//             println!("📤 Sending successful session response: {:?}", response);
//             Json(response)
//         }
//         Ok(None) => {
//             println!("❌ User not found in database for ID: {}", user_id);
//             Json(SessionStatusResponse {
//                 status_code: 401,
//                 is_valid: false,
//                 user_id: None,
//                 validator_id: None,
//             })
//         }
//         Err(db_err) => {
//             println!("❌ Database error: {}", db_err);
//             Json(SessionStatusResponse {
//                 status_code: 401,
//                 is_valid: false,
//                 user_id: None,
//                 validator_id: None,
//             })
//         }
//     }
// }

pub fn create_hash(unhashed_pass: String) -> String {
    let hashed_pass = bcrypt::hash(unhashed_pass, bcrypt::DEFAULT_COST).unwrap_or_default();
    hashed_pass
}
