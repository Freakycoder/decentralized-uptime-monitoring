use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PerfomanceDataInput{
    pub validator_id : String,
    pub website_id: String,
    pub timestamp: DateTimeWithTimeZone,
    pub http_status_code: Option<f64>,
    pub dns_resolution_ms: Option<f64>,
    pub connection_time_ms: Option<f64>,
    pub tls_handshake_ms: Option<f64>,
    pub time_to_first_byte_ms: Option<f64>,
    pub content_download_ms: Option<f64>,
    pub total_time_ms: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PerformanceOutput{
    pub status_code : u32,
    pub message : String
}