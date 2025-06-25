use crate::types::websocket::{
    Location, ServerMessage, StatusDetails, ValidatorConnection, WebsiteStatus, WebsiteStatusData,
};
use axum::extract::ws::{Message, Utf8Bytes, WebSocket};
use chrono::{FixedOffset, Utc};
use dashmap::DashMap;
use futures_util::{SinkExt, StreamExt};
use std::sync::Arc;
use tokio::sync::{broadcast, mpsc};
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct WebSocketManager {
    connections: Arc<DashMap<String, ValidatorConnection>>,
    broadcast_tx: broadcast::Sender<ServerMessage>,
}

impl WebSocketManager {
    pub fn new() -> Self {
        // this is the contructor of the class
        let (broadcast_sender, _) = broadcast::channel(1000); // tx is the one who sends message and rx are the one who gets the message when subscribed using (tx.subscribe())
        Self {
            connections: Arc::new(DashMap::new()),
            broadcast_tx: broadcast_sender,
        }
    }

    pub async fn handle_validator_connection(&self, socket: WebSocket) {
        let connection_id = Uuid::new_v4().to_string();
        println!("Validator connected: {}", connection_id);

        let (mut ws_sender, mut ws_receiver) = socket.split(); // sender used for sending messages to the validators, same as socket.send() in JS
        let connections = self.connections.clone();
        let broadcast_sender = self.broadcast_tx.clone();
        let connection_id_clone = connection_id.clone();

        let (mpsc_tx, mut mpsc_rx) = mpsc::channel::<Message>(100);

        let (registration_tx, regsitration_rx) = tokio::sync::oneshot::channel::<String>();
        let mut registration_tx = Some(registration_tx);
        let receive_task = tokio::spawn(async move {
            println!(
                "🔄 Starting receive task for connection_id: {}",
                connection_id_clone
            );

            while let Some(result) = ws_receiver.next().await {
                println!("📨 GOT SOMETHING from validator: {}", connection_id_clone);

                match result {
                    Ok(Message::Text(text)) => {
                        println!("📝 RAW TEXT MESSAGE: '{}'", text);

                        if let Ok(json) = serde_json::from_str::<serde_json::Value>(&text) {
                            println!("✅ Successfully parsed as JSON");

                            if let Some(reg_data) = json.get("register_validator") {
                                println!("🎯 Found register_validator field!");

                                if let Some(validator_id) =
                                    reg_data.get("validator_id").and_then(|v| v.as_str())
                                {
                                    println!("🆔 Registering validator: {}", validator_id);

                                    let location = reg_data.get("location").and_then(|loc| {
                                        Some(Location {
                                            latitude: loc.get("latitude")?.as_f64()?,
                                            longitude: loc.get("longitude")?.as_f64()?,
                                        })
                                    });

                                    connections.insert(
                                        connection_id_clone.clone(),
                                        ValidatorConnection {
                                            validator_id: validator_id.to_string(),
                                            location: location,
                                            connected_at: Utc::now()
                                                .with_timezone(&FixedOffset::east_opt(0).unwrap()),
                                            last_active: Utc::now()
                                                .with_timezone(&FixedOffset::east_opt(0).unwrap()),
                                        },
                                    );
                                    println!(
                                        "✅ Validator registered successfully: {}",
                                        validator_id
                                    );
                                    println!(
                                        "Currently registered validators are: {:?}",
                                        connections
                                    );
                                    if let Some(tx) = registration_tx.take() {
                                        if let Err(_) = tx.send(validator_id.to_string()) {
                                            println!("❌ Failed to signal registration completion");
                                        } else {
                                            println!("📡 Registration signal sent - broadcast subscription will start");
                                        }
                                    }
                                }
                                if let Some(website_data) = json.get("website_status") {
                                    println!("Found website status field");

                                    if let (Some(website_id), Some(timestamp), Some(validator_id)) = (
                                        // this is called tuple pattern matching. if anyone contains null then block is skipped.
                                        website_data.get("website_id").and_then(|v| v.as_str()),
                                        website_data.get("timestamp").and_then(|v| v.as_str()),
                                        website_data.get("validator_id").and_then(|v| v.as_str()),
                                    ) {
                                        let details = website_data.get("details").and_then(
                                            |status_details| {
                                                let http_status_str = status_details
                                                    .get("http_status_code")?
                                                    .as_str()?;
                                                let http_status_code = match http_status_str {
                                                    "Up" => WebsiteStatus::Up,
                                                    "Down" => WebsiteStatus::Down,
                                                    _ => return None,
                                                };

                                                Some(StatusDetails {
                                                    dns_lookup: status_details
                                                        .get("dns_lookup")
                                                        .and_then(|v| v.as_f64()),
                                                    tcp_connection: status_details
                                                        .get("tcp_connection")
                                                        .and_then(|v| v.as_f64()),
                                                    tls_handshake: status_details
                                                        .get("tls_handshake")
                                                        .and_then(|v| v.as_f64()),
                                                    ttfb: status_details
                                                        .get("ttfb")
                                                        .and_then(|v| v.as_f64()),
                                                    content_download: status_details
                                                        .get("content_download")
                                                        .and_then(|v| v.as_f64()),
                                                    http_status_code,
                                                    total_duration: status_details
                                                        .get("total_duration")
                                                        .and_then(|v| v.as_f64()),
                                                })
                                            },
                                        );

                                        let website_status_data = WebsiteStatusData {
                                            website_id: website_id.to_string(),
                                            timestamp: timestamp.to_string(),
                                            validator_id: validator_id.to_string(),
                                            details,
                                        };

                                        println!(
                                            "Parsed WebsiteStatusData: {:?}",
                                            website_status_data
                                        );

                                        let api_call_result = Self::forward_status_to_api(
                                            website_status_data.website_id,
                                            website_status_data.timestamp,
                                            website_status_data.details,
                                            website_status_data.validator_id,
                                        )
                                        .await;

                                        match api_call_result {
                                            Ok(_) => {
                                                println!("✅ Successfully forwarded website status to API for: {}", website_id);
                                            }
                                            Err(e) => {
                                                println!("❌ Failed to forward website status to API for {}: {:?}", website_id, e);
                                            }
                                        }
                                    }
                                }
                            } else {
                                println!("❌ No register_validator field found");
                                println!(
                                    "🔍 Available keys: {:?}",
                                    json.as_object().map(|obj| obj.keys().collect::<Vec<_>>())
                                );
                            }
                        } else {
                            println!("❌ Failed to parse as JSON");
                        }
                    }
                    Ok(_) => {}
                    Err(e) => {
                        eprintln!("❌ WebSocket error receiving message: {:?}", e);
                        break;
                    }
                }

                println!("🔄 Finished processing message, waiting for next...");
            }

            println!(
                "🧹 Receive task ending for connection: {}",
                connection_id_clone
            );
            connections.remove(&connection_id_clone);
        });

        // Sending messages to Validator (its a different thread performing individual task)
        let send_task = tokio::spawn(async move {
            while let Some(message) = mpsc_rx.recv().await {
                let result = ws_sender.send(message).await; // sending the server sent messages to the validator
                if result.is_err() {
                    break;
                }
            }
        });

        // broadcast only after regsitration
        let broadcast_connection_id = connection_id.clone();
        let broadcast_task = tokio::spawn(async move {
            println!("Broadcast task waiting for registration");

            match regsitration_rx.await {
                Ok(validator_id) => {
                    let mut broadcast_subscriber = broadcast_sender.subscribe();
                    println!("Broadcast subscription active for registered validator");

                    while let Ok(server_msg) = broadcast_subscriber.recv().await {
                        println!(
                            "broadcast recieved for regsiterd validator {}",
                            validator_id
                        );
                        match serde_json::to_string(&server_msg) {
                            Ok(json) => {
                                println!("Serialized broadcast for {} : {}", validator_id, json);
                                let message = Message::Text(Utf8Bytes::from(json));
                                match mpsc_tx.send(message).await {
                                    Ok(_) => {
                                        println!(
                                            "✅ Broadcast queued for validator {}: {}",
                                            validator_id, broadcast_connection_id
                                        );
                                    }
                                    Err(e) => {
                                        println!(
                                            "❌ Failed to queue broadcast for {}: {:?}",
                                            validator_id, e
                                        );
                                        break;
                                    }
                                }
                            }
                            Err(e) => {
                                println!(
                                    "❌ Failed to serialize broadcast for {}: {:?}",
                                    validator_id, e
                                );
                            }
                        }
                    }
                    println!("broadcast listening ended for validator: {}", validator_id);
                }
                Err(_) => {
                    println!(
                        "registration signal failed - no broadcast subcription for : {}",
                        broadcast_connection_id
                    )
                }
            }
        });

        // Essentially you're spawning (Creating) multiple async tasks, the moment one task fails or completes succesfully we instantly close the other 2 tasks.
        tokio::select! {
            _ = receive_task => {
                println!("Extension recieve task completed (browser closed)")
            },
            _ = send_task => {
                println!("Extension send task completed (browser closed)")
            },
            _ = broadcast_task => {
                println!("Extension broadcast task completed (browser closed)")
            },
        }

        self.connections.remove(&connection_id);
    }

    pub async fn handle_api_connection(&self, socket: WebSocket) {
        println!("API connected");

        let (_, mut ws_receiver) = socket.split();

        while let Some(result) = ws_receiver.next().await {
            match result {
                Ok(Message::Text(text)) => {
                    if let Ok(api_msg) = serde_json::from_str::<ServerMessage>(&text) {
                        println!("Received URLs from API to broadcast.");
                        let _ = self.broadcast_tx.send(api_msg);
                    }
                }
                Ok(Message::Close(_)) => {
                    println!("API disconnected");
                    break;
                }
                Err(e) => {
                    eprintln!("API WebSocket error: {:?}", e);
                    break;
                }
                _ => {}
            }
        }
    }

    pub fn website_to_broadcast(&self, url: String, id: Uuid) -> () {
        let url_to_broadcast = ServerMessage {
            url: url.to_owned(),
            id: id.to_string().to_owned(),
        };
        let _ = self.broadcast_tx.send(url_to_broadcast.clone());
        println!(
            "Broadcasted new website URL to all validators: {}",
            url_to_broadcast.url
        );
        ()
    }

    // here we're using the reqwest library which is exactly the same as axios.
    async fn forward_status_to_api(
        website_id: String,
        timestamp: String,
        details: Option<StatusDetails>,
        validator_id: String,
    ) -> Result<(), reqwest::Error> {
        let api_url = "http://localhost:3001/performace-data/add";

        let client = reqwest::Client::new();
        client
            .post(api_url)
            .json(&serde_json::json!({
                "website_id": website_id,
                "timestamp": timestamp,
                "details": details,
                "validator_id" : validator_id
            }))
            .send()
            .await?;
        Ok(())
    }
}
