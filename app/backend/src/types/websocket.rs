use std::sync::Arc;

use sea_orm::{prelude::DateTimeWithTimeZone, DatabaseConnection};
use serde::{Deserialize, Serialize};

use crate::websocket::manager::WebSocketManager;

#[derive(Debug, Serialize, Deserialize)]
pub enum ValidatorMessage {
    RegisterValidator {
        register_validator: RegisterValidatorData,
    },
    WebsiteStatus {
        website_status: WebsiteStatusData,
    },
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterValidatorData {
    pub validator_id: String,
    pub location: Option<Location>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WebsiteStatusData {
    pub url: String,
    pub timestamp: String,
    pub validator_id: String,
    pub details: Option<StatusDetails>,
}

#[derive(Debug, Serialize, Deserialize,Clone)]
pub enum WebsiteStatus {
    Up,
    Down,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct StatusDetails {
    pub dns_lookup: Option<f64>,
    pub tcp_connection: Option<f64>,
    pub tls_handshake: Option<f64>,
    pub ttfb: Option<f64>,
    pub content_download: Option<f64>,
    pub http_status_code: WebsiteStatus,
    pub total_duration : Option<f64>
}

#[derive(Debug, Clone)]
pub struct ValidatorConnection {
    pub validator_id: String,
    pub location: Option<Location>,
    pub connected_at: DateTimeWithTimeZone,
    pub last_active: DateTimeWithTimeZone,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Location {
    pub latitude: f64,
    pub longitude: f64,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ServerMessage {
    pub url: String,
}

#[derive(Debug, Clone)]
pub struct AppState {
    pub db: DatabaseConnection,
    pub ws_manager: Arc<WebSocketManager>,
}
