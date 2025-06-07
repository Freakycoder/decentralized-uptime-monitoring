use crate::{
    entities::user,
    types::user::{Claims, SignUpResponse, UserInput},
};
use axum::{
    Router,
    extract::{Json, State},
    routing::post,
};



use chrono::{Duration, Utc};

use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set};

use jsonwebtoken::{EncodingKey, Header, encode};

pub fn user_router() -> Router<DatabaseConnection> {
    Router::new()
        .route("/signup", post(signup))
        .route("/signin", post(signin))
}


#[axum::debug_handler]
async fn signup(
    State(db): State<DatabaseConnection>,
    Json(user_data): Json<UserInput>,
) -> Json<SignUpResponse> {

    let email = user_data.email;
    let password = user_data.password;

    let old_user = user::Entity::find()
        .filter(user::Column::Email.eq(&email))
        .one(&db)
        .await;

    if let Err(db_err) = old_user {
        return Json(SignUpResponse {
            status_code: 500,
            message: format!("Database error occured : {}", db_err),
            token: None,
        });
    }
    println!("Some issue occured with finding old user.");

    if let Some(_) = old_user.unwrap() {
        return Json(SignUpResponse {
            status_code: 409, //conflict status code
            message: format!("User already exist, please SignIn"),
            token: None,
        });
    }
    println!("user already exist");

    let new_user= user::ActiveModel {
        email: Set(email),
        password_hash: Set(create_hash(password)),
        ..Default::default()
    }; // this part is just creating a record to insert into db
    println!("creating new user record.");
    println!("preparing to insert user...");

    match new_user.insert(&db).await {
        // in 'new_user.insert(&db).await' we actually insert the record into db
        Ok(user) => Json(SignUpResponse {
            status_code: 200,
            message: user.id.to_string(),
            token: Some(generate_jwt(&user.id.to_string())),
        }),

        Err(err) => Json(SignUpResponse {
            status_code: 404,
            message: format!("Failed to create new user : {}", err),
            token: None,
        }),
    }
}

async fn signin(
    State(db): State<DatabaseConnection>,
    Json(user_data): Json<UserInput>,
) -> Json<SignUpResponse> {

    let email = user_data.email;
   
    let old_user = user::Entity::find()
        .filter(user::Column::Email.eq(&email))
        .one(&db)
        .await;

    if let Err(db_err) = old_user {
        return Json(SignUpResponse {
            status_code: 500,
            message: format!("Database error occured : {}", db_err),
            token: None,
        });
    }

    if let Some(existing_user) = old_user.unwrap() {
        return Json(SignUpResponse {
            status_code: 200,
            message: format!("User found"),
            token: Some(generate_jwt(&existing_user.id.to_string())),
        });
    } else {
        return Json(SignUpResponse {
            status_code: 404,
            message: format!("User not found"),
            token: None,
        });
    }
}

pub fn create_hash(unhashed_pass: String) -> String {
    let hashed_pass = bcrypt::hash(unhashed_pass, bcrypt::DEFAULT_COST).unwrap_or_default();
    hashed_pass
}

pub fn generate_jwt(user_id: &str) -> String {
    let expiration = Utc::now()
        .checked_add_signed(Duration::hours(24))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        user_id: user_id.to_owned(),
        exp: expiration,
    };
    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret("secret".as_ref()),
    )
    .unwrap();
    token
}
