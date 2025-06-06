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
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // user_id
    pub exp: usize,  // expiration
}

// Middleware specifically for validator routes
pub async fn validator_jwt_middleware(
    headers: HeaderMap,
    mut request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    println!("🔑 Validator JWT middleware triggered");

    // Extract Authorization header
    let auth_header = headers
        .get("Authorization")
        .and_then(|header| header.to_str().ok()) // here we're converting to string bcoz HeaderValue contains raw bytes
        .ok_or_else(|| {
            println!("❌ Missing Authorization header");
            StatusCode::UNAUTHORIZED
        })?;

    // Check Bearer format
    if !auth_header.starts_with("Bearer ") {
        println!("❌ Invalid Authorization header format");
        return Err(StatusCode::UNAUTHORIZED);
    }

    // Extract token
    let token = auth_header.trim_start_matches("Bearer ");

    // Decode JWT
    let secret = "secret"; // ⚠️ Use environment variable in production!
    let validation = Validation::new(Algorithm::HS256);

    let user_id = match decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_ref()),
        &validation,
    ) {
        Ok(token_data) => match token_data.claims.sub.parse::<Uuid>() {
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

    // Read the request body
    let (parts, body) = request.into_parts();
    let bytes = match axum::body::to_bytes(body, usize::MAX).await {
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

    // Rebuild request with modified body
    let modified_request = Request::from_parts(parts, Body::from(modified_body));

    println!("🚀 Forwarding modified request to validator route");
    Ok(next.run(modified_request).await)
}

// Function to modify the request body and inject user_id
fn modify_validator_request_body(body: Bytes, user_id: Uuid) -> Result<Vec<u8>, serde_json::Error> {
    // Parse the incoming JSON
    let mut json: Value = serde_json::from_slice(&body)?;

    // Inject user_id into the JSON
    if let Value::Object(ref mut map) = json {
        map.insert("user_id".to_string(), Value::String(user_id.to_string()));
        println!("📝 Injected user_id: {} into request body", user_id);
    }

    // Convert back to bytes
    let modified_json = serde_json::to_vec(&json)?;
    Ok(modified_json)
}
