use axum::{
    extract::Request,
    http::{HeaderMap, StatusCode},
    middleware::Next,
    response::Response,
};

use crate::{ utils::jwt_extractor::{extract_jwt_from_headers}};

pub async fn jwt_auth_middleware(
    headers: HeaderMap,
    mut request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    match extract_jwt_from_headers(&headers) {
        Ok(user_details) => {
            request.extensions_mut().insert(user_details.user_id);

            if let Some(validator_id) = user_details.validator_id {
                request.extensions_mut().insert(validator_id);
            }

            Ok(next.run(request).await)
        }
        Err(status) => Err(status),
    }
}