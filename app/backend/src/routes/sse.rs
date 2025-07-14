use std::{convert::Infallible, sync::Arc, time::Duration};

use crate::{redis::pubsub_manager::RedisPubSub, types::redis::AppState};
use axum::{
    debug_handler,
    extract::{Path, State},
    response::{sse::Event, IntoResponse, Response, Sse},
    routing::get,
    Router,
};
use futures_util::{Stream, StreamExt};
use uuid::Uuid;

pub fn sse_router() -> Router<AppState> {
    Router::new().route("/validator-notification/:validator_id", get(validator_notification_stream))
}

// over here we're handling the sse_event_object_stream to axum to convert it into proper sse response and send to frontend.
#[debug_handler]
async fn validator_notification_stream(
    Path(validator_id): Path<Uuid>,
    State(state): State<AppState>,
) -> Result<Sse<impl Stream<Item = Result<Event, Infallible>>>, Response> {
    println!(
        "validator {} requesting SSE notification stream",
        validator_id
    );
    let redis_pubsub = state.pubsub.clone();

    match create_notification_stream(redis_pubsub, validator_id).await {
        Ok(event_stream) => {
            // named event stream bcoz Event object stream is returned from the fn
            println!("SSE stream established for validator {}", validator_id);
            Ok(Sse::new(event_stream).keep_alive( // here we have handled the entire stream to axum to convert to sse response
                axum::response::sse::KeepAlive::new().interval(Duration::from_secs(30)),
            ))
        }
        Err(_) => {
            println!("Failed to create SSE stream for validator {}", validator_id);
            Err(axum::http::StatusCode::INTERNAL_SERVER_ERROR.into_response())
        }
    }
}

// this is a tranformation pipeline created on top of redis_stream.
async fn create_notification_stream(
    pubsub: Arc<RedisPubSub>,
    validator_id: Uuid,
) -> Result<impl Stream<Item = Result<Event, Infallible>>, Box<dyn std::error::Error + Send + Sync>>
{
    println!(
        "building SSE notification stream for validator: {}",
        validator_id
    );

    let redis_stream = pubsub.subscribe_to_notifications().await?;

    let sse_stream = redis_stream.map(move |server_message| {
        println!(
            "Forwarding notification {:?} to validator {}",
            &server_message, validator_id
        );

        match serde_json::to_string(&server_message) {
            Ok(json_data) => Ok(Event::default()
                .data(json_data)
                .event("notifiation")
                .comment(&format!("timestamp {}", chrono::Utc::now().timestamp()))),

            Err(serialization_error) => {
                println!(
                    "Failed to serialize notification for validator : {}",
                    validator_id
                );

                let error_event = serde_json::json!({ // manually creating an json object with error message in it
                    "error" : "serialization error",
                    "message" : serialization_error.to_string(),
                    "timestamp" : chrono::Utc::now().timestamp()
                });

                Ok(Event::default()
                    .data(error_event.to_string())
                    .event("notification_error") // different event
                    .comment(format!("timestamp : {}", chrono::Utc::now().timestamp())))
            }
        }
    });
    println!(
        "SSE notification stream created for validator: {}",
        validator_id
    );
    Ok(sse_stream)
}
