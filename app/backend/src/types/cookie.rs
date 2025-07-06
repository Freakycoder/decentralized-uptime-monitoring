use std::sync::Arc;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::cookie::manager::SessionStore;
use crate::websocket::manager::WebSocketManager;
// App state that includes both database and session store
#[derive(Clone)]
pub struct CookieAppState {
    pub db: sea_orm::DatabaseConnection,
    pub session_store: Arc<SessionStore>,
    pub ws : Arc<WebSocketManager>
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionData {
    pub user_id: Uuid,
    pub validator_id : Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub last_accessed: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}