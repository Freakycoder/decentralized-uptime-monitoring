use axum::{
    Json, Router,
    extract::Query,
    routing::get,
};
use serde::Deserialize;
use tower_http::cors::{Any, CorsLayer};
use sea_orm::{Database, DbErr};
pub mod entities;
pub mod routes;
pub mod types;


#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    let app = Router::new()
        .route("/", get(sayhello))
        .nest("/user", routes::user::user_router())
        // .nest("/website", routes::website_monitoring::website_router() )
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        );

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    println!("the server is running at port 3000");
    // let database_url = "postgresql://neondb_owner:npg_Hnlp2FJc9guM@ep-purple-bonus-a5mylor6-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require";
    // let db = Database::connect(database_url).await;
    // println!("Database connected successfully!");
    axum::serve(listener, app).await
}

async fn sayhello() -> &'static str{
    "greeting from root route"
}

