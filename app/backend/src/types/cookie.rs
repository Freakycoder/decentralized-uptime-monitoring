use crate::cookie::manager::SessionStore;

// App state that includes both database and session store
#[derive(Clone)]
pub struct CookieAppState {
    pub db: sea_orm::DatabaseConnection,
    pub session_store: SessionStore,
}