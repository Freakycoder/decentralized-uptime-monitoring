use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)] 
#[sea_orm(table_name = "NetworkMeasurement")]
pub struct Model{
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub device_id: Uuid,
    pub timestamp: DateTimeWithTimeZone,
    pub download_speed_mbps: Option<f64>,
    pub upload_speed_mbps: Option<f64>,
    pub latency_ms: Option<i32>,
    pub packet_loss_percent: Option<f64>,
    pub jitter_ms: Option<f64>,
    pub provider: Option<String>,
    pub connection_type: Option<String>,
    pub ip_address: Option<String>,
    pub location_accuracy: Option<i32>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub is_validated: bool,
    pub validation_score: Option<f64>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
