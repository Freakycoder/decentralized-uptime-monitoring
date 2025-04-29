// src/websocket/manager.rs
use axum::extract::ws::{Message, WebSocket};
use chrono::Utc;
use dashmap::DashMap;
use futures_util::{SinkExt, StreamExt};
use std::sync::Arc;
use tokio::sync::{broadcast, mpsc};
use uuid::Uuid;

use crate::websocket::types::{ApiMessage, ServerMessage, ValidatorConnection, ValidatorMessage};

#[derive(Debug, Clone)]
pub struct WebSocketManager {
    connections: Arc<DashMap<String, ValidatorConnection>>,
    broadcast_tx: broadcast::Sender<ServerMessage>,
}

impl WebSocketManager {
    pub fn new() -> Self {
        let (broadcast_tx, _) = broadcast::channel(1000);
        Self {
            connections: Arc::new(DashMap::new()),
            broadcast_tx,
        }
    }

    pub async fn handle_validator_connection(&self, socket: WebSocket) {
        let connection_id = Uuid::new_v4().to_string();
        println!("Validator connected: {}", connection_id);

        let (mut ws_sender, mut ws_receiver) = socket.split(); // sender used for sending messages to the validators, same as socket.send() in JS
        let connections = self.connections.clone();
        let broadcast_tx = self.broadcast_tx.clone();
        let connection_id_clone = connection_id.clone();

        let (client_tx, mut client_rx) = mpsc::channel::<Message>(100);

        // Receiving from Validator
        let receive_task = tokio::spawn(async move {
            while let Some(result) = ws_receiver.next().await {
                // "ws_receiver.next().await" recieves messages and its return type is Result wrapped in Option, like this - Option<Result<Message,Error>>. So we're running a loop as long as we've Some(...) of message, if its none then dont enter {} and do anything.
                // as long as something is there, not sure good or bad message enter the {}
                match result {
                    Ok(Message::Text(text)) => {
                        if let Ok(msg) = serde_json::from_str::<ValidatorMessage>(&text) {
                            match msg {
                                ValidatorMessage::RegisterValidator {
                                    validator_id,
                                    device_info,
                                    location,
                                } => {
                                    println!("Registered validator: {}", validator_id);
                                    connections.insert(
                                        connection_id_clone.clone(),
                                        ValidatorConnection {
                                            connection_id: connection_id_clone.clone(),
                                            validator_id,
                                            device_info,
                                            location,
                                            connected_at: Utc::now(),
                                            last_active: Utc::now(),
                                        },
                                    );
                                }
                                ValidatorMessage::WebsiteStatus {
                                    url,
                                    status,
                                    response_time,
                                    timestamp,
                                    details,
                                } => {
                                    println!("Received website status: {}", url);
                                    // forward to API
                                    if let Err(err) = Self::forward_status_to_api(
                                        url,
                                        status,
                                        response_time,
                                        timestamp,
                                        details,
                                    ).await {
                                        eprintln!("Error forwarding to API: {:?}", err);
                                    }
                                }
                            }
                        }
                    }
                    Ok(Message::Close(_)) => { // when a validator client closes the socket (disconnects/refreshes browser/turns off device) the server recieves close message
                        println!("Validator disconnected: {}", connection_id_clone);
                        break;
                    }
                    Err(e) => {
                        eprintln!("WebSocket error: {:?}", e);
                        break;
                    }
                    _ => {} // _ means anything else/default case
                }
            }
            connections.remove(&connection_id_clone);
        });

        // Sending messages to Validator
        let send_task = tokio::spawn(async move {
            while let Some(message) = client_rx.recv().await {
                if ws_sender.send(message).await.is_err() {
                    break;
                }
            }
        });

        // Listening for broadcasts
        let broadcast_task = tokio::spawn(async move {
            let mut broadcast_rx = broadcast_tx.subscribe();
            while let Ok(server_msg) = broadcast_rx.recv().await {
                if let Ok(json) = serde_json::to_string(&server_msg) {
                    if client_tx.send(Message::Text(json)).await.is_err() {
                        break;
                    }
                }
            }
        });

        // Wait until any of the tasks complete
        tokio::select! {
            _ = receive_task => {},
            _ = send_task => {},
            _ = broadcast_task => {},
        }

        self.connections.remove(&connection_id);
    }

    pub async fn handle_api_connection(&self, socket: WebSocket) {
        println!("API connected");

        let (mut ws_sender, mut ws_receiver) = socket.split();

        while let Some(result) = ws_receiver.next().await {
            match result {
                Ok(Message::Text(text)) => {
                    if let Ok(api_msg) = serde_json::from_str::<ApiMessage>(&text) {
                        match api_msg {
                            ApiMessage::UrlsToPing { urls } => {
                                println!("Received URLs from API to broadcast.");
                                let server_msg = ServerMessage::PingUrls { urls };
                                let _ = self.broadcast_tx.send(server_msg);
                            }
                        }
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

    async fn forward_status_to_api(
        url: String,
        status: String,
        response_time: u64,
        timestamp: String,
        details: Option<String>,
    ) -> Result<(), reqwest::Error> {
        let api_url = "http://your-api-server.com/website-status"; // replace with your actual API endpoint

        let client = reqwest::Client::new();
        client
            .post(api_url)
            .json(&serde_json::json!({
                "url": url,
                "status": status,
                "response_time": response_time,
                "timestamp": timestamp,
                "details": details,
            }))
            .send()
            .await?;

        Ok(())
    }
}
