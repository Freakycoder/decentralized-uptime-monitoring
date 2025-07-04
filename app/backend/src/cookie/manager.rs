use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;
use chrono::{DateTime, Utc, Duration};
use serde::{Deserialize, Serialize};

// Define what we store in each session
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionData {
    pub user_id: Uuid,
    pub validator_id : Option<Uuid>,
    pub is_validator : bool,
    pub created_at: DateTime<Utc>,
    pub last_accessed: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

impl SessionData {
    pub fn new(user_id: Uuid) -> Self {
        let now = Utc::now();
        Self {
            user_id,
            validator_id : None,
            is_validator : false,
            created_at: now,
            last_accessed: now,
            expires_at: now + Duration::hours(24), // Session expires in 24 hours
        }
    }
    // passing the self object or struct i would say.
    pub fn is_expired(&self) -> bool {
        Utc::now() > self.expires_at
    }

    pub fn refresh(&mut self) {
        self.last_accessed = Utc::now();
        // Extend expiration by 24 hours from now
        self.expires_at = Utc::now() + Duration::hours(24);
    }

    pub fn add_validator(&mut self , validator_id : Uuid){
        self.validator_id = Some(validator_id);
    }
}

// In-memory session store (we'll discuss Redis later)
#[derive(Debug, Clone)]
pub struct SessionStore {
    // Using RwLock for concurrent access - multiple readers, single writer
    sessions: Arc<RwLock<HashMap<String, SessionData>>>,
}

impl SessionStore {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    // Create a new session and return the session ID
    pub async fn create_session(&self, user_id: Uuid) -> String {
        let session_id = Uuid::new_v4().to_string();
        let session_data = SessionData::new(user_id);
        
        let mut sessions = self.sessions.write().await; // we're asking for exlusive write access to the hashmap
        sessions.insert(session_id.clone(), session_data); // here after getting the write access, we insert key value pair.
        
        println!("✅ Created new session: {} for user: {}", session_id, user_id);
        session_id
    }

    // Retrieve and refresh a session if it exists and isn't expired
    pub async fn get_session(&self, session_id: &str) -> Option<SessionData> {
        let mut sessions = self.sessions.write().await;
        
        if let Some(session) = sessions.get_mut(session_id) {
            if session.is_expired() {
                // Cleaning up the expired session.
                sessions.remove(session_id);
                println!("🗑️ Removed expired session: {}", session_id);
                return None;
            }
            // Refresh the session
            session.refresh();
            println!("🔄 Refreshed session: {}", session_id);
            return Some(session.clone());
        }
        
        None
    }

    pub async fn modify_session(&self, validator_id : Uuid, session_id: &str) -> bool{
        let mut sessions = self.sessions.write().await;

        if let Some(session) = sessions.get_mut(session_id){
            session.add_validator(validator_id);
            return true;
        }
        false
    } 

    // Remove a session (for logout)
    pub async fn delete_session(&self, session_id: &str) -> bool {
        let mut sessions = self.sessions.write().await;
        if sessions.remove(session_id).is_some() { // remove returns sessionData, so we just check using is_some()
            println!("🗑️ Deleted session: {}", session_id);
            true
        } else {
            false
        }
    }

    // Clean up expired sessions (you'd run this periodically)
    pub async fn cleanup_expired_sessions(&self) {
        let mut sessions = self.sessions.write().await;
        let initial_count = sessions.len();
        
        sessions.retain(|session_id, session_data| {
            if session_data.is_expired() {
                println!("🗑️ Cleaning up expired session: {}", session_id);
                false
            } else {
                true
            }
        });
        
        let final_count = sessions.len();
        if initial_count != final_count {
            println!("🧹 Cleaned up {} expired sessions", initial_count - final_count);
        }
    }
}