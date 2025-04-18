use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct UserInput{
    pub username : String,
    pub email : String,
    pub password : String
}