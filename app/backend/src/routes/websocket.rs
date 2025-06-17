use crate::websocket::manager::WebSocketManager;
use axum::{
    Router,
    extract::{State, WebSocketUpgrade},
    response::Response,
    routing::get,
};
use std::sync::Arc;


pub fn websocket_router(manager: Arc<WebSocketManager>) -> Router {
    Router::new()
        .route("/upgrade", get(websocket_upgrade))
        .with_state(manager)
}

async fn websocket_upgrade(
    ws: WebSocketUpgrade,
    State(manager): State<Arc<WebSocketManager>>,
) -> Response {
    println!("upgrading to websocket...");
    ws.on_upgrade(move |socket| async move { manager.handle_validator_connection(socket).await })
}