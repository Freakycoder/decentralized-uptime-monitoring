use std::sync::Arc;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::redis::cookie_manager::SessionStore;
use crate::redis::pubsub_manager::RedisPubSub;
// App state that includes database and all the classes manager.
#[derive(Clone)]
pub struct AppState {
    pub db: sea_orm::DatabaseConnection,
    pub session_store: Arc<SessionStore>,
    pub pubsub : Arc<RedisPubSub>
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionData {
    pub user_id: Uuid,
    pub validator_id : Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub last_accessed: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerMessage{
    pub url : String,
    pub id : String
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceQueueMessage{
    pub id : String,
    pub validator_id : String,
    pub website_id : String,
    pub session_id : String,
    pub run_number : u32,
    pub total_runs : Option<u32>,
    pub timestamp : chrono::DateTime<chrono::Utc>,
    pub data : PerformanceData
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceData{
    pub dns_lookup: Option<f64>,
    pub tcp_connection: Option<f64>,
    pub tls_handshake: Option<f64>,
    pub ttfb: Option<f64>,
    pub content_download: Option<f64>,
    pub total_duration: f64,
    pub status_code: u32,
}