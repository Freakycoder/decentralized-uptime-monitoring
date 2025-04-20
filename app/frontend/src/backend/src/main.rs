use axum::{Router, routing::get};
use sea_orm::Database;
use tower_http::cors::{Any, CorsLayer};
pub mod entities;
pub mod routes;
pub mod types;

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    let database_url = "postgresql://neondb_owner:npg_Hnlp2FJc9guM@ep-purple-bonus-a5mylor6-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require";
    let db = Database::connect(database_url)
        .await
        .expect("failed to connect");
    println!("Database connected successfully!");

    let app = Router::new()
        .route("/", get(sayhello))
        .nest("/user", routes::user::user_router().with_state(db))
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
    axum::serve(listener, app).await
}

async fn sayhello() -> &'static str {
    "greeting from root route"
}
