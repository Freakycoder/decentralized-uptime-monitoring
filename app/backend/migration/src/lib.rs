pub use sea_orm_migration::prelude::*;

// Import migration modules as they're created
// The first one will be created by the CLI
mod m20250511_000001_create_tables;
mod m20250511_132813_create_tables;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20250511_000001_create_tables::Migration),
            Box::new(m20250511_132813_create_tables::Migration),
        ]
    }
}