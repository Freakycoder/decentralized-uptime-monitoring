use crate::websocket::manager::WebSocketManager;
use axum::{
    Router,
    extract::{State, WebSocketUpgrade},
    response::Response,
    routing::post,
};
use std::sync::Arc;


pub fn websocket_router(manager: Arc<WebSocketManager>) -> Router {
    Router::new()
        .route("/ws", post(websocket_upgrade))
        .with_state(manager)
}

async fn websocket_upgrade(
    ws: WebSocketUpgrade,
    State(manager): State<Arc<WebSocketManager>>,
) -> Response {
    ws.on_upgrade(move |socket| async move { manager.handle_validator_connection(socket).await })
}

