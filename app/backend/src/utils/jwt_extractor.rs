use axum::http::{StatusCode, HeaderMap};
use uuid::Uuid;
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::env;

pub struct AuthenticatedUser {
    pub user_id: Uuid,
    pub validator_id: Option<Uuid>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub user_id: Uuid,
    pub validator_id: Option<Uuid>,
    pub exp: usize,
    pub iat: usize,
}

pub fn extract_jwt_from_headers(headers: &HeaderMap) -> Result<AuthenticatedUser, StatusCode> {
    let auth_header = headers
        .get("authorization")
        .and_then(|header| header.to_str().ok())
        .ok_or(StatusCode::UNAUTHORIZED)?;

    if !auth_header.starts_with("Bearer ") {
        return Err(StatusCode::UNAUTHORIZED);
    }

    let token = &auth_header[7..]; // Remove "Bearer " prefix

    let claims = verify_jwt(token).map_err(|_| StatusCode::UNAUTHORIZED)?;

    Ok(AuthenticatedUser {
        user_id: claims.user_id,
        validator_id: claims.validator_id,
    })
}

impl Claims {
    pub fn new(user_id: Uuid, validator_id: Option<Uuid>) -> Self {
        let now = Utc::now();
        let exp = now + Duration::hours(24); // Token expires in 24 hours
        
        Self {
            user_id,
            validator_id,
            iat: now.timestamp() as usize,
            exp: exp.timestamp() as usize,
        }
    }
}

pub fn get_jwt_secret() -> String {
    env::var("JWT_SECRET").unwrap_or_else(|_| "your-secret-key".to_string())
}

pub fn create_jwt(user_id: Uuid, validator_id: Option<Uuid>) -> Result<String, jsonwebtoken::errors::Error> {
    let claims = Claims::new(user_id, validator_id);
    let secret = get_jwt_secret();
    
    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_ref()),
    )
}

pub fn verify_jwt(token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let secret = get_jwt_secret();
    let validation = Validation::new(Algorithm::HS256);
    
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_ref()),
        &validation,
    )
    .map(|token_data| token_data.claims)
}