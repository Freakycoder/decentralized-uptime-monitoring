use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AddWebsiteInput{
    pub url_to_monitor : String
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AddWebsiteResponse{
    pub status_code : u32,
    pub message : String
}
