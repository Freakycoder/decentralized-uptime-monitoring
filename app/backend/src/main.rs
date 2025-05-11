use std::sync::Arc;

use axum::{Router, routing::get};
use sea_orm::Database;
use tower_http::cors::{Any, CorsLayer};
use websocket::manager::WebSocketManager;
pub mod entities;
pub mod routes;
pub mod types;
pub mod websocket;
use crate::types::websocket::AppState;

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    let database_url = "postgresql://neondb_owner:npg_ofquS9UYb8AE@ep-cool-field-a47qdvry-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";
    let db = Database::connect(database_url)
        .await
        .expect("failed to connect");
    println!("Database connected successfully!");

    let ws_manager = Arc::new(WebSocketManager::new()); // the WebSocketManager::new() is invoking the constructor present in websocket class, which initializes the connectin and broadcast
    let app_state = AppState{ // this is done bcoz we cannot pass db and ws individually by using with_state twice.
        db : db.clone(),
        ws_manager : ws_manager.clone()
    };

    let app = Router::new()
        .route("/", get(sayhello))
        .nest("/user", routes::user::user_router().with_state(db.clone()))
        .nest("/ws", routes::websocket::websocket_router(ws_manager))
        .nest("/website-monitor", routes::website_monitoring::website_router().with_state(app_state))
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        );

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3001")
        .await
        .unwrap();
    println!("the server is running at port 3001");
    axum::serve(listener, app).await
}

async fn sayhello() -> &'static str {
    "greeting from root route"
}

