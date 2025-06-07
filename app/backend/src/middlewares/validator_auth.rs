// src/middleware/validator_auth.rs
use axum::{
    body::Body,
    extract::Request,
    http::{HeaderMap, StatusCode},
    middleware::Next,
    response::Response,
};
use bytes::Bytes;
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde_json::Value;
use uuid::Uuid;
use crate::types::user::Claims;

pub async fn validator_jwt_middleware(
    headers: HeaderMap,
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    println!("🔑 Validator JWT middleware triggered");

    let auth_header = headers
        .get("Authorization")
        .and_then(|header| header.to_str().ok()) // here we're converting to string bcoz HeaderValue contains raw bytes
        .ok_or_else(|| {
            println!("❌ Missing Authorization header");
            StatusCode::UNAUTHORIZED
        })?;

    if !auth_header.starts_with("Bearer ") {
        println!("❌ Invalid Authorization header format");
        return Err(StatusCode::UNAUTHORIZED);
    }
    let token = auth_header.trim_start_matches("Bearer ");

    let secret = "secret";
    let validation = Validation::new(Algorithm::HS256); // algo used for decoding

    let user_id = match decode::<Claims>( // the decode fn returns result<tokenData<claims>, error>
        token,
        &DecodingKey::from_secret(secret.as_ref()), // coverting the secret into format decode understands
        &validation,
    ) {
        Ok(token_data) => match token_data.claims.user_id.parse::<Uuid>() {
            Ok(uuid) => {
                println!("✅ Decoded user_id from JWT: {}", uuid);
                uuid
            }
            Err(_) => {
                println!("❌ Invalid user_id format in JWT");
                return Err(StatusCode::UNAUTHORIZED);
            }
        },
        Err(e) => {
            println!("❌ JWT validation failed: {:?}", e);
            return Err(StatusCode::UNAUTHORIZED);
        }
    };

    // Read the request body.
    //This is necessary because in Axum (or generally in hyper), Request is not clonable or directly mutable — so if you want to read or modify the body, you have to break it apart first.
    let (parts, body) = request.into_parts(); // splits the req into 2 segment (parts and body). body contains data & part contains metadata
    let bytes = match axum::body::to_bytes(body, usize::MAX).await { // consumes the body stream and accumulates the bytes into one chunk.
        Ok(bytes) => bytes, 
        Err(_) => {
            println!("❌ Failed to read request body");
            return Err(StatusCode::BAD_REQUEST);
        }
    };

    // Parse JSON body and inject user_id
    let modified_body = match modify_validator_request_body(bytes, user_id) {
        Ok(body) => body,
        Err(_) => {
            println!("❌ Failed to modify request body");
            return Err(StatusCode::BAD_REQUEST);
        }
    };

    // below we are Rebuilding request with modified body
    let modified_request = Request::from_parts(parts, Body::from(modified_body));

    println!("🚀 Forwarding modified request to validator route");
    Ok(next.run(modified_request).await)
}

fn modify_validator_request_body(body: Bytes, user_id: Uuid) -> Result<Vec<u8>, serde_json::Error> {

    let mut json = serde_json::from_slice(&body)?; // converting from bytes to json

    if let Value::Object(ref mut map) = json { // Rust enum variants (like Value::Object(...)) have data inside them.
        map.insert("user_id".to_string(), Value::String(user_id.to_string())); // could also String::from() for 'k'. for value part - the uuid is first converted to string then converted to value string type
        println!("📝 Injected user_id: {} into request body", user_id);
    }

    let modified_json = serde_json::to_vec(&json)?;
    Ok(modified_json)
}
