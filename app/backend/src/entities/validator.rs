use sea_orm::entity::prelude::*;


#[derive(Clone, Debug, PartialEq, DeriveEntityModel)] 
#[sea_orm(table_name = "Validators")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    #[sea_orm(unique)]
    pub user_id: Uuid,
    #[sea_orm(unique)]
    pub wallet_address : String,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    #[sea_orm(unique)]
    pub device_id : String,
    #[sea_orm(default_value = "CURRENT_TIMESTAMP")]
    pub created_at : Option<DateTimeWithTimeZone>
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(belongs_to = "super::user::Entity", from = "Column::UserId", to = "super::user::Column::Id")]
    Users
}

impl ActiveModelBehavior for ActiveModel {}

impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Users.def()
    }
}
