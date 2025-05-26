use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)] 
#[sea_orm(table_name = "Reward")]
pub struct Model{
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub user_id: Uuid,
    pub amount: f64,
    pub reward_type: String,
    pub contribution_id: Option<Uuid>,
    pub transaction_hash: Option<String>,
    pub status: String,
    pub created_at: DateTimeWithTimeZone,
    pub processed_at: Option<DateTimeWithTimeZone>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
