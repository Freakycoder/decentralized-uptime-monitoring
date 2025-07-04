use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct UserInput{
    pub email : String,
    pub password : String
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SignUpResponse{
    pub status_code : u32,
    pub message : String,
    pub user_id : Option<String>
}


#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
   pub user_id: String,
   pub exp: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ValidatorInput{
    pub user_id: Uuid,
    pub wallet_address : String,
    pub latitude: f64,
    pub longitude: f64,
    pub device_id : String
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifyValidatorResponse{
    pub status_code : u32,
    pub message : String,
    pub validator_data : Option<ValidatorData>
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ValidatorData{
   pub validator_id : Uuid,
   pub latitude : f64,
   pub longitude : f64
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifySignatureRequest{
    pub message : String,
    pub signature : String,
    pub public_key : String
}