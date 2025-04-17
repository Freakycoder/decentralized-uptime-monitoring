use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct UserInput{
    username : String,
    email : String,
    passowrd : String
}