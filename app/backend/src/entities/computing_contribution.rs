use sea_orm::entity::prelude::*;


#[derive(Clone, Debug, PartialEq, DeriveEntityModel)] 
#[sea_orm(table_name = "ComputingContribution")]
pub struct Model{
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub device_id: Uuid,
    pub timestamp: DateTimeWithTimeZone,
    pub task_type: String,
    pub cpu_seconds: Option<f64>,
    pub memory_mb_seconds: Option<f64>,
    pub storage_mb_seconds: Option<f64>,
    pub bandwidth_mb: Option<f64>,
    pub task_id: Option<Uuid>,
    pub is_validated: bool,
    pub validation_score: Option<f64>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}