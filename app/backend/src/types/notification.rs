use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateNotificationRequest {
    pub validator_id: Uuid,
    pub title: String,
    pub message: String,
    pub notification_type: String,
    pub data: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NotificationResponse {
    pub id: Uuid,
    pub validator_id: Uuid,
    pub title: String,
    pub message: String,
    pub notification_type: String,
    pub read: bool,
    pub action_taken: Option<String>,
    pub created_at: DateTimeWithTimeZone,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetNotificationsResponse {
    pub status_code: u32,
    pub message: String,
    pub notifications: Vec<NotificationResponse>,
    pub unread_count: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateNotificationResponse {
    pub status_code: u32,
    pub notification: Option<NotificationResponse>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MarkAllReadRequest {
    pub validator_id: Uuid,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MarkAllReadResponse {
    pub status_code: u32,
    pub updated_count: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateNotificationRequest {
    pub read: Option<bool>,
    pub action_taken: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateNotificationResponse {
    pub status_code: u32,
    pub notification: Option<NotificationResponse>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NotificationQuery {
    pub validator_id: Uuid,
    pub notification_type: Option<String>,
    pub read: Option<bool>,
    pub limit: Option<u64>,
    pub offset: Option<u64>,
}
// below code is created to be reused. everytime i fetch noti from the database its of type noti Model. instead of creating it as rust struct and send as response i just use the below code to autoconvert it into rust struct.
impl From<crate::entities::notification::Model> for NotificationResponse {
    fn from(model: crate::entities::notification::Model) -> Self {
        Self {
            id: model.id,
            validator_id: model.validator_id,
            title: model.title,
            message: model.message,
            notification_type: model.notification_type,
            read: model.read,
            action_taken: model.action_taken,
            created_at: model.created_at,
        }
    }
}