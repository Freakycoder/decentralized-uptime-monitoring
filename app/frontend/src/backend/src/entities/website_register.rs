use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)] 
#[sea_orm(table_name = "WebsiteRegister")]
pub struct Model{
    #[sea_orm(primary_key)]
    pub id: Uuid,
    #[sea_orm(unique)]
    pub website: String,
    pub timestamp: DateTimeWithTimeZone,
    pub is_reachable: bool,
    pub http_status_code: Option<i32>,
    pub error_type: Option<String>,
    pub connection_type: Option<String>,
    pub provider: Option<String>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub is_validated: bool,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}