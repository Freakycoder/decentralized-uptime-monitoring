use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "Notifications")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub validator_id: Uuid,
    pub title: String,
    pub message: String,
    pub notification_type: String,
    pub read: bool,
    pub action_taken: Option<String>,
    pub created_at: DateTimeWithTimeZone
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::validator::Entity",
        from = "Column::ValidatorId",
        to = "super::validator::Column::Id"
    )]
    Validator,
}

impl Related<super::validator::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Validator.def()
    }
}

impl ActiveModelBehavior for ActiveModel {
}