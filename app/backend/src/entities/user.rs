use sea_orm::entity::prelude::*;


#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)] 
#[sea_orm(table_name = "Users")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    #[sea_orm(unique)]
    pub email: String,
    pub password_hash: String,
    #[sea_orm(default_value = "CURRENT_TIMESTAMP")]
    pub created_at : Option<DateTimeWithTimeZone>
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_one = "super::validator::Entity")]
    Validators,
    #[sea_orm(has_one = "super::website_register::Entity")]
    WebsiteRegister,
}

impl ActiveModelBehavior for ActiveModel {}

impl Related<super::validator::Entity> for Entity {
    fn to() -> RelationDef {
        super::validator::Relation::Users.def().rev()
    }
}

impl Related<super::user::Entity> for super::website_register::Entity {
    fn to() -> RelationDef {
        super::website_register::Relation::Users.def()
    }
}
