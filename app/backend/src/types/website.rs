use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct AddWebsiteInput{
    pub user_id: Uuid,
    pub url_to_monitor : String
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AddWebsiteResponse{
    pub status_code : u32,
    pub message : String
}