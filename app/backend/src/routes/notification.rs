use crate::entities::notification;
use crate::middlewares::validator_auth::validator_jwt_middleware;
use crate::types::notification::{
    CreateNotificationRequest, CreateNotificationResponse, GetNotificationsResponse,
    MarkAllReadRequest, MarkAllReadResponse, NotificationQuery, NotificationResponse
};
use axum::{
    extract::{Path, Query, State},
    middleware,
    routing::{get, post, put},
    Json, Router,
};
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, PaginatorTrait, QueryFilter,
    QueryOrder, Set,
};
use uuid::Uuid;

pub fn notification_router() -> Router<DatabaseConnection> {
    Router::new()
        .route("/", post(create_notification))
        .route("/user/:validator_id", get(get_user_notifications))
        .route("/mark-all-read", put(mark_all_read))
        .route("/unread-count/:validator_id", get(get_unread_count))
        .layer(middleware::from_fn(validator_jwt_middleware))
}

#[axum::debug_handler]
async fn create_notification(
    State(db): State<DatabaseConnection>,
    Json(request): Json<CreateNotificationRequest>,
) -> Json<CreateNotificationResponse> {
    let new_notification = notification::ActiveModel {
        validator_id: Set(request.validator_id),
        title: Set(request.title),
        message: Set(request.message),
        notification_type: Set(request.notification_type),
        read: Set(false),
        action_taken: Set(None),
        ..Default::default()
    };

    match new_notification.insert(&db).await {
        Ok(notification) => Json(CreateNotificationResponse {
            status_code: 201,
            notification: Some(NotificationResponse::from(notification)),
        }),
        Err(_) => Json(CreateNotificationResponse {
            status_code: 500,
            notification: None,
        }),
    }
}

#[axum::debug_handler]
async fn get_user_notifications(
    State(db): State<DatabaseConnection>,
    Path(validator_id): Path<Uuid>,
    Query(query): Query<NotificationQuery>,
) -> Json<GetNotificationsResponse> {
    let mut select = notification::Entity::find().filter(notification::Column::ValidatorId.eq(validator_id));

    // Apply filters
    if let Some(notification_type) = &query.notification_type {
        select = select.filter(notification::Column::NotificationType.eq(notification_type));
    }

    if let Some(read) = query.read {
        select = select.filter(notification::Column::Read.eq(read));
    }

    // Order by created_at descending (newest first)
    select = select.order_by_desc(notification::Column::CreatedAt);

    // Apply pagination
    let limit = query.limit.unwrap_or(50).min(100); // Max 100 notifications per page
    let offset = query.offset.unwrap_or(0);

    match select.paginate(&db, limit).fetch_page(offset / limit).await {
        Ok(notifications) => {
            // Get unread count
            let unread_count = notification::Entity::find()
                .filter(notification::Column::ValidatorId.eq(validator_id))
                .filter(notification::Column::Read.eq(false))
                .count(&db)
                .await
                .unwrap_or(0);

            Json(GetNotificationsResponse {
                status_code: 200,
                message: "Notifications retrieved successfully".to_string(),
                notifications: notifications
                    .into_iter()
                    .map(NotificationResponse::from)
                    .collect(),
                unread_count: unread_count as usize,
            })
        }
        Err(db_err) => Json(GetNotificationsResponse {
            status_code: 500,
            message: format!("Database error occurred: {}", db_err),
            notifications: vec![],
            unread_count: 0,
        }),
    }
}

#[axum::debug_handler]
async fn mark_all_read(
    State(db): State<DatabaseConnection>,
    Json(request): Json<MarkAllReadRequest>,
) -> Json<MarkAllReadResponse> {
    match notification::Entity::update_many()
        .filter(notification::Column::ValidatorId.eq(request.validator_id))
        .filter(notification::Column::Read.eq(false))
        .col_expr(notification::Column::Read, true.into())
        .exec(&db)
        .await
    {
        Ok(update_result) => Json(MarkAllReadResponse {
            status_code: 200,
            updated_count: update_result.rows_affected as usize,
        }),
        Err(_) => Json(MarkAllReadResponse {
            status_code: 500,
            updated_count: 0,
        }),
    }
}

#[axum::debug_handler]
async fn get_unread_count(
    State(db): State<DatabaseConnection>,
    Path(validator_id): Path<Uuid>,
) -> Json<serde_json::Value> {
    match notification::Entity::find()
        .filter(notification::Column::ValidatorId.eq(validator_id))
        .filter(notification::Column::Read.eq(false))
        .count(&db)
        .await
    {
        Ok(count) => Json(serde_json::json!({
            "status_code": 200,
            "message": "Unread count retrieved successfully",
            "unread_count": count
        })),
        Err(db_err) => Json(serde_json::json!({
            "status_code": 500,
            "message": format!("Database error occurred: {}", db_err),
            "unread_count": 0
        })),
    }
}