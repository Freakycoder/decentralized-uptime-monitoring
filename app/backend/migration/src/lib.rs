pub use sea_orm_migration::prelude::*;

// Only include the migrations we actually want to keep
mod m20250511_132813_create_tables;
mod m20250628_090238_notification_table;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            // First migration: creates all our base tables (Users, Validators, etc.)
            Box::new(m20250511_132813_create_tables::Migration),
            // Second migration: adds the Notifications table with proper foreign keys
            Box::new(m20250628_090238_notification_table::Migration),
        ]
    }
}