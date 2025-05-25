use sea_orm::entity::prelude::*;


#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)] 
#[sea_orm(table_name = "Devices")]
pub struct Model{
    #[sea_orm(primary_key)]
    pub id : Uuid,
    pub user_id : Uuid,
    pub device_name : String,
    pub device_type : String,
    pub device_id : String,
    pub os_type : Option<String>,
    pub os_version : Option<String>,
    pub last_active : Option<DateTimeWithTimeZone>,
    pub is_active : bool,
    pub created_at : DateTimeWithTimeZone,
    pub updated_at : DateTimeWithTimeZone
}
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}