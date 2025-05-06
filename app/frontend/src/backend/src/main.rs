use std::sync::Arc;

use axum::{Router, routing::get};
use sea_orm::Database;
use tower_http::cors::{Any, CorsLayer};
use websocket::manager::WebSocketManager;
pub mod entities;
pub mod routes;
pub mod types;
pub mod websocket;

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    let database_url = "postgresql://neondb_owner:npg_Hnlp2FJc9guM@ep-purple-bonus-a5mylor6-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require";
    let db = Database::connect(database_url)
        .await
        .expect("failed to connect");
    println!("Database connected successfully!");

    let ws_manager = Arc::new(WebSocketManager::new()); // the WebSocketManager::new() is invoking the constructor present in websocket class, which initializes the connectin and broadcast

    let app = Router::new()
        .route("/", get(sayhello))
        .nest("/user", routes::user::user_router().with_state(db.clone()))
        .nest("/ws", routes::websocket::websocket_router(ws_manager))
        .nest("/website-monitor", routes::website_monitoring::website_router().with_state(db.clone()))
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

