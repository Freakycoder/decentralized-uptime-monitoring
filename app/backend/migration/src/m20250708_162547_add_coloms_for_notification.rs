use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        println!("🔄 Adding website_url and website_id columns to Notifications table...");
        
        manager
            .alter_table(
                Table::alter()
                    .table(Alias::new("Notifications")) // ✅ Explicitly use case-sensitive name
                    .add_column(
                        ColumnDef::new(Alias::new("website_url"))
                            .string()
                            .null()
                    )
                    .add_column(
                        ColumnDef::new(Alias::new("website_id"))
                            .string()
                            .null()
                    )
                    .to_owned(),
            )
            .await?;
        
        // Add index for better performance when querying by website
        manager
            .create_index(
                Index::create()
                    .name("idx_notifications_website_id")
                    .table(Alias::new("Notifications"))
                    .col(Alias::new("website_id"))
                    .to_owned(),
            )
            .await?;
        
        println!("✅ Website fields added to Notifications table");
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        println!("🔄 Removing website fields from Notifications table...");
        
        // Drop index first
        manager
            .drop_index(
                Index::drop()
                    .name("idx_notifications_website_id")
                    .to_owned(),
            )
            .await?;
        
        // Drop columns
        manager
            .alter_table(
                Table::alter()
                    .table(Alias::new("Notifications"))
                    .drop_column(Alias::new("website_url"))
                    .drop_column(Alias::new("website_id"))
                    .to_owned(),
            )
            .await?;
        
        println!("✅ Website fields removed from Notifications table");
        Ok(())
    }
}