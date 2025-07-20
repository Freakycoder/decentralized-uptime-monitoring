use axum::{
    routing::get,
    Router,
};
use migration::{Migrator, MigratorTrait};
use sea_orm::Database;
use std::{env, sync::Arc};
use tower_http::cors::CorsLayer;

pub mod redis;
pub mod entities;
pub mod middleware;
pub mod routes;
pub mod types;
pub mod utils;
use crate::{redis::{client::RedisClientManager, cookie_manager::SessionStore, pubsub_manager::RedisPubSub}, types::redis::AppState};

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
    let redis_client_manager = RedisClientManager::new().await.expect("failed to initialize redis client manager - ensure redis server is running.");
    let redis_client = redis_client_manager.get_client();
    let redis_pubsub_manager = Arc::new(RedisPubSub::new(redis_client.clone()));
    let redis_cookie_manager = Arc::new(SessionStore::new(redis_client.clone()));

    // Create combined application state that includes database, websocket, and session management
    let app_state = AppState {
        db: db.clone(),
        session_store: redis_cookie_manager,
        pubsub : redis_pubsub_manager
    };

    // Build the application router with all routes and middleware
    let app = Router::new()
        .route("/", get(sayhello))
        .nest(
            "/user",
            routes::user::user_router().with_state(app_state.clone()),
        )
        .nest(
            "/validator",
            routes::validator::validator_router().with_state(app_state.clone()),
        )
        .nest(
            "/add-website",
            routes::add_website::add_website_router().with_state(app_state.clone()),
        )
        .nest(
            "/performance-data",
            routes::website_performace::performance_router().with_state(db.clone()),
        )
        .nest(
            "/notifications",
            routes::notification::notification_router().with_state(db.clone()),
        )
        .nest("/sse", routes::sse::sse_router().with_state(app_state))
        .layer(
            CorsLayer::very_permissive()
        );

    // Start the server
    let listener = tokio::net::TcpListener::bind("localhost:3001")
        .await
        .unwrap();
    println!("the server is running at port 3001");
    axum::serve(listener, app).await
}

async fn sayhello() -> &'static str {
    "greeting from root route"
}
