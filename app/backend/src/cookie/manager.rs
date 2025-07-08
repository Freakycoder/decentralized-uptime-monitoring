use crate::types::cookie::SessionData;
use chrono::{Duration, Utc};
use redis::{AsyncCommands, Client, RedisResult};
use uuid::Uuid;

impl SessionData {
    pub fn new(user_id: Uuid) -> Self {
        let now = Utc::now();
        Self {
            user_id,
            validator_id: None,
            created_at: now,
            last_accessed: now,
            expires_at: now + Duration::hours(2), // Session expires in 2 hours
        }
    }

    pub fn is_expired(&self) -> bool {
        let is_expired = Utc::now() > self.expires_at;
        if is_expired {
            println!(
                "⏰ Session expired: now={}, expires_at={}",
                Utc::now(),
                self.expires_at
            );
        }
        is_expired
    }

    pub fn refresh(&mut self) {
        self.last_accessed = Utc::now();
        // Extend expiration by 2 hours from now
        self.expires_at = Utc::now() + Duration::hours(2);
        println!("🔄 Session refreshed, new expiry: {}", self.expires_at);
    }

    pub fn add_validator(&mut self, validator_id: Uuid) {
        self.validator_id = Some(validator_id);
        println!("🎫 Added validator ID to session: {}", validator_id);
    }
}

#[derive(Debug, Clone)]
pub struct SessionStore {
    redis_client: Client,
}

impl SessionStore {
    pub async fn new() -> RedisResult<Self> {
        println!("Connecting to redis...");
        let redis_url =
            std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string());
        let client = Client::open(redis_url)?;
        let mut conn = client.get_multiplexed_async_connection().await?;
        let _: () = conn.ping().await?;
        println!("Redis client connected succesfully");

        Ok(Self {
            redis_client: client,
        })
    }

    // Create a new session and return the session ID
    pub async fn create_session(
        &self,
        user_id: Uuid,
    ) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
        let session_id = Uuid::new_v4().to_string();
        let session_data = SessionData::new(user_id);

        let mut conn = self.redis_client.get_multiplexed_async_connection().await?;

        let session_data_json = serde_json::to_string(&session_data)?;
        let expiration_secs = 2 * 60 * 60;

        let _: () = conn
            .set_ex(&session_id, session_data_json, expiration_secs)
            .await?;

        println!(
            "✅ Created new session: {} for user: {}",
            session_id, user_id
        );
        println!("🕐 Session expires at: {}", session_data.expires_at);
        Ok(session_id)
    }

    // Retrieve and refresh a session if it exists and isn't expired.
    pub async fn get_session(&self, session_id: &str) -> Option<SessionData> {
        let mut conn = match self.redis_client.get_multiplexed_async_connection().await {
            Ok(conn) => conn,
            Err(_) => {
                println!("Error connecting to redis server in get_Session");
                return None;
            }
        };

        let session_data_json: Option<String> = match conn.get(session_id).await {
            Ok(data) => data,
            Err(_) => {
                println!("Error getting session data from the server");
                return None;
            }
        };

        if let Some(json) = session_data_json {
            println!("Found session data in redis");
            let mut session_data: SessionData = match serde_json::from_str(&json) {
                Ok(data) => data,
                Err(_) => {
                    println!("Error parsing data from string to object");
                    return None;
                }
            };

            if session_data.is_expired() {
                println!("Session is expired, deleting it....");
                let _: RedisResult<()> = conn.del(session_id).await;
                return None;
            }

            session_data.refresh();

            if let Ok(updated_json) = serde_json::to_string(&session_data) {
                let expiration_secs = 2 * 60 * 60; // 2 hrs
                let _: RedisResult<()> =
                    conn.set_ex(session_id, updated_json, expiration_secs).await;
                println!("Refereshed the exisiting session");
            }

            return Some(session_data);
        } else {
            println!("Session not found in redis");
            return None;
        }
    }

    pub async fn modify_session(&self, validator_id: Uuid, session_id: &str) -> bool {
        println!(
            "🔄 Modifying session {} to add validator {}",
            session_id, validator_id
        );

        if let Some(mut session_data) = self.get_session(session_id).await {
            session_data.add_validator(validator_id);

            let mut conn = match self.redis_client.get_multiplexed_async_connection().await {
                Ok(conn) => conn,
                Err(_) => {
                    println!("Error connecting to the redis server");
                    return false;
                }
            };

            if let Ok(session_data_string) = serde_json::to_string(&session_data) {
                let expiration_secs = 2 * 60 * 60;
                let result: RedisResult<()> = conn
                    .set_ex(session_id, session_data_string, expiration_secs)
                    .await;

                match result {
                    Ok(_) => {
                        println!("Succesfully added validator to session data");
                        return true;
                    }
                    Err(_) => {
                        println!("Failed to add validatorId to session data");
                        return false;
                    }
                }
            }
        };
        println!("Error getting the session data from redis server");
        return false;
    }

    // Remove a session (for logout)
    pub async fn delete_session(&self, session_id: &str) -> bool {
        let mut conn = match self.redis_client.get_multiplexed_async_connection().await {
            Ok(conn) => conn,
            Err(e) => {
                println!("❌ Redis connection error: {}", e);
                return false;
            }
        };
        
        let result: RedisResult<u32> = conn.del(format!("session:{}", session_id)).await;
        
        match result {
            Ok(deleted_count) => {
                if deleted_count > 0 {
                    println!("🗑️ Deleted session: {}", session_id);
                    true
                } else {
                    println!("❌ Session not found for deletion: {}", session_id);
                    false
                }
            }
            Err(e) => {
                println!("❌ Redis delete error: {}", e);
                false
            }
        }
    }
}
