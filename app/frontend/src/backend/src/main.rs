use axum::{
    Json, Router,
    extract::Query,
    routing::get,
};
use serde::Deserialize;
use tower_http::cors::{Any, CorsLayer};
use sea_orm::{Database, DbErr};

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    let app = Router::new()
        .route("/", get(root))
        .route("/data", get(receive_data))
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
    let database_url = "postgresql://neondb_owner:npg_Hnlp2FJc9guM@ep-purple-bonus-a5mylor6-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require";
    let db = Database::connect(database_url).await;
    println!("Database connected successfully!");
    axum::serve(listener, app).await

}

async fn root() -> &'static str {
    "hello from the server"
}
async fn receive_data(Query(params): Query<Params>) -> String {
    format!(
        "hi I'm {}, my age and id is {} & {} respectively",
        params.name, params.age, params.id
    )
}

#[derive(Deserialize)]
pub struct Params {
    name: String,
    age: u32,
    id: u32,
}

