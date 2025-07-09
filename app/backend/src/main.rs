use axum::{
    http::{header::HeaderName, HeaderValue},
    routing::get,
    Router,
};
use migration::{Migrator, MigratorTrait};
use sea_orm::Database;
use std::{env, sync::Arc};
use tower_http::cors::CorsLayer;
use websocket::manager::WebSocketManager;

pub mod cookie;
pub mod entities;
pub mod routes;
pub mod types;
pub mod utils;
pub mod websocket;

use crate::{cookie::manager::SessionStore, types::cookie::CookieAppState};

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
        Ok(_) => {
            println!("Migration applied succesfully")
        }
        Err(e) => {
            eprintln!("Migration failed with error: {}", e);
            panic!("cannot continue without tables");
        }
    }
    println!("Database connected successfully!");

    // Initialize shared application state
    let ws_manager = Arc::new(WebSocketManager::new()); // WebSocket connection manager
    let cookie_manager = Arc::new(
        SessionStore::new()
            .await
            .expect("Failed to connect to redis - make sure redis server is running"),
    ); // In-memory session store

    // Create combined application state that includes database, websocket, and session management
    let app_state = CookieAppState {
        db: db.clone(),
        ws: ws_manager.clone(),
        session_store: cookie_manager.clone(),
    };

    // Build the application router with all routes and middleware
    let app = Router::new()
        .route("/", get(sayhello))
        .nest(
            "/user",
            routes::user::user_router().with_state(app_state.clone()),
        )
        .nest("/ws", routes::websocket::websocket_router(ws_manager))
        .nest(
            "/validator",
            routes::validator::validator_router().with_state(app_state.clone()),
        )
        .nest(
            "/add-website",
            routes::add_website::add_website_router().with_state(app_state),
        )
        .nest(
            "/performance-data",
            routes::website_performace::performance_router().with_state(db.clone()),
        )
        .nest(
            "/notifications",
            routes::notification::notification_router().with_state(db.clone()),
        )
        .layer(
            CorsLayer::new()
                .allow_origin("http://localhost:3000".parse::<HeaderValue>().unwrap())
                .allow_methods([
                    axum::http::Method::GET,
                    axum::http::Method::POST,
                    axum::http::Method::PUT,
                    axum::http::Method::PATCH,
                    axum::http::Method::DELETE,
                ])
                .allow_headers([
                    HeaderName::from_static("content-type"),
                    HeaderName::from_static("authorization"),
                    HeaderName::from_static("cookie"),
                    HeaderName::from_static("set-cookie"),
                ])
                .allow_credentials(true),
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
