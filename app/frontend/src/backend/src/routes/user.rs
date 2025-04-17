use axum::{
    extract::Query, routing::get, Json, Router
};
use sea_orm::{Database, DbErr};
use crate::types::user::UserInput;

pub fn user_router() -> Router{
    Router::new()
    .route("/signup", get(signup))
}

async fn signup() -> &'static str{
    "hello from user route"
}
