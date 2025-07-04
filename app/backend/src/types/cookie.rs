use std::sync::Arc;

use crate::cookie::manager::SessionStore;
use crate::websocket::manager::WebSocketManager;
// App state that includes both database and session store
#[derive(Clone)]
pub struct CookieAppState {
    pub db: sea_orm::DatabaseConnection,
    pub session_store: Arc<SessionStore>,
    pub ws : Arc<WebSocketManager>
}