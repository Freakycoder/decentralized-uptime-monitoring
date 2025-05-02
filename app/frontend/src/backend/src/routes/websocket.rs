use crate::types::websocket::{
    ServerMessage, StatusDetails, ValidatorConnection, ValidatorMessage, WebsiteStatus,
};
use axum::extract::ws::{Message, WebSocket};
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
                                    location,
                                } => {
                                    println!("Registered validator: {}", validator_id);
                                    connections.insert(
                                        connection_id_clone.clone(),
                                        ValidatorConnection {
                                            validator_id,
                                            location,
                                            connected_at: Utc::now()
                                                .with_timezone(&FixedOffset::east_opt(0).unwrap()),
                                            last_active: Utc::now()
                                                .with_timezone(&FixedOffset::east_opt(0).unwrap()),
                                        },
                                    );
                                }
                                ValidatorMessage::WebsiteStatus {
                                    url,
                                    status,
                                    response_time,
                                    timestamp,
                                    details,
                                    validator_id,
                                    latitude,
                                    longitude,
                                } => {
                                    println!("Received website status: {}", url);

                                    if let Err(err) = Self::forward_status_to_api(
                                        url,
                                        status,
                                        response_time,
                                        timestamp,
                                        details,
                                        validator_id,
                                        latitude,
                                        longitude,
                                    )
                                    .await
                                    {
                                        eprintln!("Error forwarding to API: {:?}", err);
                                    }
                                }
                            }
                        }
                    }
                    Ok(Message::Close(_)) => {
                        // when a validator client closes the socket (disconnects/refreshes browser/turns off device) the server recieves close message
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

        // Sending messages to Validator (its a different thread performing individual task)
        let send_task = tokio::spawn(async move {
            while let Some(message) = mpsc_rx.recv().await {
                let result = ws_sender.send(message).await; // sending the server sent messages to the validator
                if result.is_err() {
                    break;
                }
            }
        });

        // Listening for broadcasts
        let broadcast_task = tokio::spawn(async move {
            let mut broadcast_subscriber = broadcast_sender.subscribe(); // here we have subscribed for messages sent by sender
            while let Ok(server_msg) = broadcast_subscriber.recv().await {
                // here we're awaiting for the messages to come
                if let Ok(json) = serde_json::to_string(&server_msg) {
                    // here we're converting the json to string to sent over websocket
                    let msg_sent = mpsc_tx.send(Message::Text(json.into())).await; // here we're pushing the string message onto mpsc channel, so that it gets recieved by ws_sender
                    if msg_sent.is_err() {
                        // if any error in sending the message to mpsc channel of that validator then break the connection.
                        break;
                    }
                }
            }
        });

        // Essentially you're spawning (Creating) multiple async tasks, the moment one task fails or completes succesfully we instantly close the other 2 tasks.
        tokio::select! {
            _ = receive_task => {},
            _ = send_task => {},
            _ = broadcast_task => {},
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

    // here we're using the reqwest library which is exatcly the same as axios.
    async fn forward_status_to_api(
        url: String,
        status: WebsiteStatus,
        response_time: u32,
        timestamp: String,
        details: Option<StatusDetails>,
        validator_id: String,
        latitude: f64,
        longitude: f64,
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
                "validator_id" : validator_id,
                "latitude" : latitude,
                "longitude" : longitude
            }))
            .send()
            .await?;

        Ok(())
    }
}
