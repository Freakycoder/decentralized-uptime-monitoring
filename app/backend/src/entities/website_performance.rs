use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)] 
#[sea_orm(table_name = "WebsitePerformance")]
pub struct Model{
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub validator_id : Uuid,
    pub website_id: Uuid,
    pub timestamp: DateTimeWithTimeZone,
    pub http_status_code: Option<f64>,
    pub dns_resolution_ms: Option<f64>,
    pub connection_time_ms: Option<f64>,
    pub tls_handshake_ms: Option<f64>,
    pub time_to_first_byte_ms: Option<f64>,
    pub content_download_ms: Option<f64>,
    pub total_time_ms: Option<f64>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}