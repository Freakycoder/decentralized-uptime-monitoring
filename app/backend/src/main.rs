use std::{env, sync::Arc};
use migration::{Migrator, MigratorTrait};
use axum::{Router, routing::get};
use sea_orm::Database;
use tower_http::cors::{Any, CorsLayer};
use tower_cookies::CookieManagerLayer; // Add this import for cookie handling
use websocket::manager::WebSocketManager;

pub mod entities;
pub mod routes;
pub mod types;
pub mod websocket;
pub mod cookie;
pub mod utils;

use crate::{cookie::manager::SessionStore, types::{cookie::CookieAppState}};

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    dotenvy::dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("set in env file");
    println!("Connecting to database: {}", &database_url[..50]);
    
    // Establish database connection
    let db = Database::connect(database_url)
        .await
        .expect("failed to connect");
    
    // Run database migrations
    match Migrator::up(&db, None).await {
        Ok(_) => {println!("Migration applied succesfully")},
        Err(e) => {
            eprintln!("Migration failed with error: {}", e);
            panic!("cannot continue without tables");
        }
    }
    println!("Database connected successfully!");

    // Initialize shared application state
    let ws_manager = Arc::new(WebSocketManager::new()); // WebSocket connection manager
    let cookie_manager = Arc::new(SessionStore::new()); // In-memory session store
    
    // Create combined application state that includes database, websocket, and session management
    let app_state = CookieAppState{
        db : db.clone(),
        ws : ws_manager.clone(),
        session_store : cookie_manager.clone()
    };

    // Build the application router with all routes and middleware
    let app = Router::new()
        .route("/", get(sayhello))
        .nest("/user", routes::user::user_router().with_state(app_state.clone()))
        .nest("/ws", routes::websocket::websocket_router(ws_manager))
        .nest("/validator", routes::validator::validator_router().with_state(app_state.clone()))
        .nest("/add-website", routes::add_website::add_website_router().with_state(app_state))
        .nest("/performance-data", routes::website_performace::performance_router().with_state(db.clone()))
        .nest("/notifications", routes::notification::notification_router().with_state(db.clone()))
        // Add middleware layers - order matters!
        .layer(CookieManagerLayer::new()) // Cookie handling middleware - must come before CORS
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        );

    // Start the server
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3001")
        .await
        .unwrap();
    println!("the server is running at port 3001");
    axum::serve(listener, app).await
}

async fn sayhello() -> &'static str {
    "greeting from root route"
}