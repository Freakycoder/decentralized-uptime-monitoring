use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct UserInput {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SignUpResponse {
    pub status_code: u32,
    pub message: String,
    pub user_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginResponse {
    pub status_code: u32,
    pub message: String,
    pub user_data: Option<UserData>,
}

#[derive(Debug, Serialize, Deserialize)]

pub struct UserData {
    pub user_id: Uuid,
    pub validator_id: Option<Uuid>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ValidatorInput {
    pub user_id: Uuid,
    pub wallet_address: String,
    pub latitude: f64,
    pub longitude: f64,
    pub device_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifyValidatorResponse {
    pub status_code: u32,
    pub message: String,
    pub validator_data: Option<ValidatorData>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ValidatorData {
    pub validator_id: Uuid,
    pub latitude: f64,
    pub longitude: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifySignatureRequest {
    pub message: String,
    pub signature: String,
    pub public_key: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SessionStatusResponse {
    pub status_code: u32,
    pub is_valid: bool,
    pub user_id: Option<String>,
    pub validator_id: Option<String>,
}