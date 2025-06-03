use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)] 
#[sea_orm(table_name = "UsageMetric")]
pub struct Model{
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub device_id: Uuid,
    pub timestamp: DateTimeWithTimeZone,
    pub metric_type: String,
    pub metric_value: serde_json::Value,
    pub is_validated: bool,
    pub validation_score: Option<f64>,
}
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
