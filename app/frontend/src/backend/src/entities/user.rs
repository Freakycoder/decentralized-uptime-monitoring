use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)] 
#[sea_orm(table_name = "Users")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub username: String,
    #[sea_orm(unique)]
    pub email: String,
    pub password_hash: String,
    #[sea_orm(default_value = "CURRENT_TIMESTAMP")]
    pub created_at : Option<DateTimeWithTimeZone>
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}