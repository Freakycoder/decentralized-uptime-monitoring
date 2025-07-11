use axum::{
    extract::Request,
    http::{HeaderMap, StatusCode},
    middleware::Next,
    response::Response,
};
use uuid::Uuid;

use crate::{ utils::jwt_extractor::{extract_jwt_from_headers}};

pub async fn jwt_auth_middleware(
    headers: HeaderMap,
    mut request: Request,
    next: Next,
) -> Result<Response, StatusCode> {

    if let Ok(user_details) = extract_jwt_from_headers(&headers){
        request.extensions_mut().insert(user_details.user_id);

        if let Some(validator_id) = user_details.validator_id {
            request.extensions_mut().insert(validator_id);
        }
    }

    Ok(next.run(request).await)
}

// Helper function to extract user_id from request extensions
pub fn get_user_id_from_request(request: &Request) -> Option<Uuid> {
    request.extensions().get::<Uuid>().copied()
}