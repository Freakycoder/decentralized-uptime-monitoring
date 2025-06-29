use std::{env, sync::Arc};
use migration::{Migrator, MigratorTrait};
use axum::{Router, routing::get};
use sea_orm::Database;
use tower_http::cors::{Any, CorsLayer};
use websocket::manager::WebSocketManager;
pub mod entities;
pub mod routes;
pub mod types;
pub mod websocket;
pub mod middlewares;
use crate::types::websocket::AppState;

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    dotenvy::dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("set in env file");
    println!("Connecting to database: {}", &database_url[..50]);
    let db = Database::connect(database_url)
        .await
        .expect("failed to connect");
    match Migrator::up(&db, None).await {
        Ok(_) => {println!("Migration applied succesfully")},
        Err(e) => {
            eprintln!("Migration failed with error: {}", e);
            panic!("cannot continue without tables");
        }
    }
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
        .nest("/validator", routes::validator::validator_router().with_state(db.clone()))
        .nest("/add-website", routes::add_website::add_website_router().with_state(app_state))
        .nest("/performance-data", routes::website_performace::performance_router().with_state(db.clone()))
        .nest("/notifications", routes::notification::notification_router().with_state(db.clone()))
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
