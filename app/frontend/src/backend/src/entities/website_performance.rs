use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)] 
#[sea_orm(table_name = "WebsitePerformance")]
pub struct Model{
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub validator_id : String,
    pub website_id: Uuid,
    pub timestamp: DateTimeWithTimeZone,
    pub http_status_code: Option<i32>,
    pub error_type: Option<String>,
    pub connection_type: Option<String>,
    pub dns_resolution_ms: Option<i32>,
    pub connection_time_ms: Option<i32>,
    pub tls_handshake_ms: Option<i32>,
    pub time_to_first_byte_ms: Option<i32>,
    pub content_download_ms: Option<i32>,
    pub total_time_ms: i32,
    pub content_size_bytes: Option<i32>,
    pub contains_expected_content: Option<bool>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub is_validated: bool,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}