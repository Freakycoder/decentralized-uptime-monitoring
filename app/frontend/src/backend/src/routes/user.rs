use axum::{
    extract::Query, routing::get, Json, Router
};
use sea_orm::{Database, DbErr};
use crate::types::user::UserInput;

pub fn user_router() -> Router{
    Router::new()
    .route("/signup", get(signup))
}

async fn signup(Json(user_data) : Json<UserInput>){
    let username = user_data.username;
    let email = user_data.email;
    let password = user_data.password;

    

}
