use axum::{
    extract::State,
    http::StatusCode,
    routing::post,
    Json, Router,
};

use crate::types::redis::{AppState, PerformanceQueueMessage};

#[derive(serde::Serialize)]
pub struct QueuePublishResponse {
    pub success: bool,
    pub message: String,
    pub queue_length: Option<usize>,
}

pub fn queue_router() -> Router<AppState> {
    Router::new().route("/publish", post(publish_to_queue))
}

#[axum::debug_handler]
async fn publish_to_queue(
    State(state): State<AppState>,
    Json(input): Json<PerformanceQueueMessage>,
) -> Result<Json<QueuePublishResponse>, StatusCode> {
    
    match state.queue.enqueue_performance_data("performance_queue", input).await {
        Ok(queue_length) => {
            println!("Successfully published performance data to queue");
            Ok(Json(QueuePublishResponse {
                success: true,
                message: "Performance data published to queue successfully".to_string(),
                queue_length: Some(queue_length),
            }))
        }
        Err(err) => {
            eprintln!("Failed to publish to queue: {}", err);
            Ok(Json(QueuePublishResponse {
                success: false,
                message: format!("Failed to publish to queue: {}", err),
                queue_length: None,
            }))
        }
    }
}