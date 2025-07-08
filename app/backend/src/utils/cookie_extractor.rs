use axum::http::StatusCode;
use tower_cookies::Cookies;
use uuid::Uuid;
use crate::cookie::manager::SessionStore;
use crate::types::cookie::SessionData;

pub async fn authenticate_session(
    cookies: &Cookies,
    session_store: &SessionStore,
) -> Result<SessionData, StatusCode> {
    println!("🔍 Starting session authentication...");

    let session_id = cookies
        .get("session_id")
        .map(|cookie| {
            println!("✅ Found session_id cookie: {}", cookie.value());
            cookie.value().to_owned()
        })
        .ok_or_else(|| {
            println!("❌ No session_id cookie found");
            StatusCode::UNAUTHORIZED
        })?;

    println!("🔑 Looking up session in store: {}", session_id);

    let session_data = session_store
        .get_session(&session_id)
        .await
        .ok_or_else(|| {
            println!("❌ Invalid or expired session: {}", session_id);
            println!("💾 Session store might be empty or session might have expired");
            StatusCode::UNAUTHORIZED
        })?;

    println!("✅ Valid session found for user: {}", session_data.user_id);
    println!("🎫 Validator ID in session: {:?}", session_data.validator_id);
    Ok(session_data)
}

pub async fn get_authenticated_user_id(
    cookies: &Cookies,
    session_store: &SessionStore,
) -> Result<Uuid, StatusCode> {
    println!("🔍 Getting authenticated user ID...");
    let session_data = authenticate_session(cookies, session_store).await?;
    println!("✅ Returning user ID: {}", session_data.user_id);
    Ok(session_data.user_id)
}

pub async fn get_authenticated_validator(
    cookies: &Cookies,
    session_store: &SessionStore,
) -> Result<(Uuid, Uuid), StatusCode> {
    println!("🔍 Getting authenticated validator...");
    let session_data = authenticate_session(cookies, session_store).await?;
    
    let validator_id = session_data.validator_id.ok_or_else(|| {
        println!("❌ User {} is not a validator", session_data.user_id);
        StatusCode::FORBIDDEN
    })?;
    
    println!("✅ Returning user ID: {} and validator ID: {}", session_data.user_id, validator_id);
    Ok((session_data.user_id, validator_id))
}