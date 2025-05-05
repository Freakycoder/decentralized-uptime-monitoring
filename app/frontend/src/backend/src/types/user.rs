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

#[derive(Debug, Serialize, Deserialize)]
pub struct ValidatorInput{
    pub user_id: String,
    pub wallet_address : String,
    pub latitude: f64,
    pub longitude: f64,
    pub device_id : String
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifyValidatorResponse{
    pub status_code : u32,
    pub message : String
}


#[derive(Debug, Serialize, Deserialize)]
pub struct VerifySignatureRequest{
    pub message : String,
    pub signature : String,
    pub public_key : String
}