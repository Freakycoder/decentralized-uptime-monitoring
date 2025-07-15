use std::sync::Arc;

use redis::{Client, RedisResult};

pub struct RedisClientManager {
    client: Arc<Client>,
}

impl RedisClientManager {
    pub async fn new() -> Result<Self> {
        println!("Initializing shared redis client manager...");
        let redis_url =
            std::env::var("REDIS_URL").unwrap_or_else(|_| format!("redis://localost:6379"));
        println!("Connecting to redis at : {}", redis_url);
        let client = Client::open(redis_url)?;
        let mut conn = client.get_multiplexed_async_connection().await?;
        let _: () = redis::AsyncCommands::ping(&mut conn).await?;
        println!("✅ Redis client manager initialized successfully");

        Ok(Self {
            client: Arc::new(client),
        })
    }

    pub fn get_client(&self) -> Client{
        (*self.client).clone() // here with '*' we're dereferencing it. getting the actual Client object not a reference to it.
    }
}
