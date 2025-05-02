use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum ValidatorMessage {
    #[serde(rename = "register_validator")]
    RegisterValidator {
        validator_id: String,
        #[serde(default)]
        location: Option<Location>,
    },
    #[serde(rename = "website_status")]
    WebsiteStatus {
        url: String,
        status: WebsiteStatus,
        response_time: u32,
        timestamp: String,
        #[serde(default)]
        details: Option<StatusDetails>,
        validator_id: String,
        latitude: f64,
        longitude: f64,
    },
}

#[derive(Debug, Serialize, Deserialize)]
pub enum WebsiteStatus {
    Up,
    Down,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct StatusDetails {
    pub dns_lookup: Option<u32>,
    pub tcp_connection: Option<u32>,
    pub tls_handshake: Option<u32>,
    pub ttfb: Option<u32>,
    pub content_download: Option<u32>,
    pub http_status_code: Option<u16>,
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
