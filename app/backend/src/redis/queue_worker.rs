use std::{sync::Arc, thread::sleep, time::Duration};

use crate::{redis::queue_manager::RedisQueue, types::redis::PerformanceQueueMessage};

pub struct QueueWorker {
    queue: Arc<RedisQueue>,
    queue_name: String,
    is_running: bool,
}

impl QueueWorker {
    pub fn new(queue: Arc<RedisQueue>, queue_name: String) -> Self {
        println!("Initialized redis worker.");
        Self {
            queue,
            queue_name,
            is_running: false,
        }
    }

    pub async fn start(&mut self) {
        if self.is_running {
            println!("Queue worker already running");
            return;
        }

        self.is_running = true;
        println!("Starting queue worker for : {}", self.queue_name);

        while self.is_running {
            match self.queue.dequeue_performance_data(&self.queue_name).await {
                Ok(Some(message)) => {
                    if message.data.status_code == 200 {
                        println!("Status code is 200");
                        let message = match self.success_call(message).await {
                            Ok(message) => {
                                println!("status : success , message : {}", message);
                                message
                            },
                            Err(e) => {
                                println!("Status : error , message : {}",e);
                                e.to_string()
                            }
                        };
                        println!("Message {} successfully sent to Api", message);
                    }
                    else {
                        println!("Status code is not 200: {}", message.data.status_code);
                        // Send mail to user (placeholder)
                        self.send_mail_notification(&message).await;
                        
                        // Still forward to performance-data/add endpoint
                        let result = match self.failure_call(message).await {
                            Ok(message) => {
                                println!("Non-200 status data forwarded successfully: {}", message);
                                message
                            },
                            Err(e) => {
                                println!("Failed to forward non-200 status data: {}", e);
                                e.to_string()
                            }
                        };
                        println!("Non-200 status message processed: {}", result);
                    }

                }
                Ok(None) => {
                    continue;
                }
                Err(e) => {
                    println!("Queue error receiving messages {}", e);
                    sleep(Duration::from_secs(1));
                }
            }
        }
    }

    async fn success_call(&self, message : PerformanceQueueMessage) -> Result<String, Box<dyn std::error::Error>>{
        let message_sent = match self.send_reqwest(message).await{
            Ok(data_sent) => data_sent,
            Err(e) => {format!("error in sending the data {}",e)}
        };

        Ok(message_sent)
    }
    async fn failure_call(&self, message : PerformanceQueueMessage)-> Result<String, Box<dyn std::error::Error>>{
        let message_sent = match self.send_reqwest(message).await{
            Ok(data_sent) => data_sent,
            Err(e) => {format!("error in sending the data {}",e)}
        };

        Ok(message_sent)
    }

    async fn send_reqwest(&self, message : PerformanceQueueMessage) -> Result<String, Box<dyn std::error::Error>>{
        let client  = reqwest::Client::new();
        
        // Convert PerformanceQueueMessage to the format expected by performance-data/add endpoint
        let payload = serde_json::json!({
            "validator_id": message.validator_id,
            "website_id": message.website_id,
            "timestamp": message.timestamp,
            "http_status_code": message.data.status_code as f64,
            "dns_resolution_ms": message.data.dns_lookup,
            "connection_time_ms": message.data.tcp_connection,
            "tls_handshake_ms": message.data.tls_handshake,
            "time_to_first_byte_ms": message.data.ttfb,
            "content_download_ms": message.data.content_download,
            "total_time_ms": message.data.total_duration
        });
        
        let response = client
        .post("http://localhost:3001/performance-data/add")
        .json(&payload)
        .send()
        .await?
        .text()// converting the response body into string
        .await?;
        Ok(response)
    }
    
    // Placeholder for mail notification
    async fn send_mail_notification(&self, message: &PerformanceQueueMessage) {
        println!("[MAIL PLACEHOLDER] Sending notification for failed request:");
        println!("  Website ID: {}", message.website_id);
        println!("  Validator ID: {}", message.validator_id);
        println!("  Status Code: {}", message.data.status_code);
        println!("  Timestamp: {}", message.timestamp);
        // TODO: Implement actual mail sending logic here
    }
}
