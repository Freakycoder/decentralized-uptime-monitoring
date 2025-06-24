use axum::{
    extract::State,
    middleware,
    routing::post,
    Json, Router,
};
use sea_orm::{ActiveModelTrait, Set, DatabaseConnection};
use crate::entities::website_performance;
use crate::middlewares::validator_auth::validator_jwt_middleware;
use crate::types::performance_data::{PerformanceOutput, PerfomanceDataInput};

pub fn performance_router() -> Router<DatabaseConnection> {
    Router::new().route(
        "/add",
        post(add_performance_data)
            .layer(middleware::from_fn(validator_jwt_middleware)),
    )
}

#[axum::debug_handler]
async fn add_performance_data(
    State(db): State<DatabaseConnection>,
    Json(input): Json<PerfomanceDataInput>,
) -> Json<PerformanceOutput> {
    let db = db.clone();

    let performance = website_performance::ActiveModel {
        validator_id: Set(input.validator_id),
        website_id: Set(input.website_id),
        timestamp: Set(input.timestamp),
        http_status_code: Set(input.http_status_code),
        dns_resolution_ms: Set(input.dns_resolution_ms),
        connection_time_ms: Set(input.connection_time_ms),
        tls_handshake_ms: Set(input.tls_handshake_ms),
        time_to_first_byte_ms: Set(input.time_to_first_byte_ms),
        content_download_ms: Set(input.content_download_ms),
        total_time_ms: Set(input.total_time_ms),
        ..Default::default()
    };

    match performance.insert(&db).await {
        Ok(_) => Json(PerformanceOutput {
            status_code: 200,
            message: "✅ Performance data saved successfully".to_string(),
        }),
        Err(err) => Json(PerformanceOutput {
            status_code: 500,
            message: format!("❌ Failed to save performance data: {}", err),
        }),
    }
}
