use axum::{
 routing::get, Router
};


pub fn website_router() -> Router{
    Router::new()
    .route("/signup", get(signup))
}

async fn signup() -> &'static str{
    "hello from website status"
}
