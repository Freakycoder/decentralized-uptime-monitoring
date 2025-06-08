pub use sea_orm_migration::prelude::*;
mod m20250511_132813_create_tables;
mod m20250608_091629_fix_website_register;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20250511_132813_create_tables::Migration),
            Box::new(m20250608_091629_fix_website_register::Migration),
        ]
    }
}