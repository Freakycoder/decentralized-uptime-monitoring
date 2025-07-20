use redis::{AsyncCommands, Client, RedisResult};

use crate::types::redis::PerformanceQueueMessage;

#[derive(Debug, Clone)]
pub struct RedisQueue {
    pub redis_client: Client,
}

impl RedisQueue {
    pub fn new(redis_client: Client) -> Self {
        println!("Initialziing redis queue manager...");
        Self {
            redis_client: redis_client,
        }
    }

    pub async fn enqueue_performance_data(
        &self,
        queue_name: &str,
        message: PerformanceQueueMessage,
    ) -> RedisResult<usize> {
        let mut conn = self.redis_client.get_multiplexed_async_connection().await?;

        let message_json = match serde_json::to_string(&message) {
            Ok(message_string) => message_string,
            Err(e) => {
                format!("Serialization of message failed due to: {}", e)
            }
        };

        let queue_length: usize = conn.lpush(queue_name, message_json).await?;
        println!("Pushed the message to queue");
        Ok(queue_length)
    }

    pub async fn dequeue_perfomace_data(&self, queue_name: &str) -> RedisResult<Option<PerformanceQueueMessage>>{
        let mut conn = self.redis_client.get_multiplexed_async_connection().await?;
        let result : Option<String> = conn.rpop(queue_name, None).await?;

        match result{
            Some(message) => {
                match serde_json::from_str::<PerformanceQueueMessage>(&message) {
                    Ok(message_json) => {
                        println!("Dequeued performance data {:?}", message_json);
                        Ok(Some(message_json))
                    },
                    Err(e) => {
                        println!("Failed to deserialize message {}",e);
                        Ok(None)
                    }
                }
            },
            None => Ok(None)
        }
    }
}
