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
            queue: queue,
            queue_name: queue_name,
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
            match self.queue.dequeue_perfomace_data(&self.queue_name).await {
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
        let response = client
        .post("http://localhost:3001/performace-data/add")
        .json(&message)
        .send()
        .await?
        .text()// converting the response body into string
        .await?;
        Ok(response)
    }
}
