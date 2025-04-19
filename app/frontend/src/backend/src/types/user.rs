use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct UserInput{
    pub username : String,
    pub email : String,
    pub password : String
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SignUpResponse{
    pub status_code : u32,
    pub message : String,
    pub token : Option<String>
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
   pub sub: String,           
   pub exp: usize,           
    
}