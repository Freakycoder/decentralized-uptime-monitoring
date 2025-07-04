use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        println!("🔄 Creating Notifications table...");
        
        manager
            .create_table(
                Table::create()
                    .table(Notifications::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Notifications::Id)
                            .uuid()
                            .not_null()
                            .primary_key()
                            .default(Expr::cust("gen_random_uuid()")),
                    )
                    .col(
                        ColumnDef::new(Notifications::ValidatorId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(Notifications::Title)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(Notifications::Message)
                            .text()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(Notifications::NotificationType)
                            .string()
                            .not_null()
                            .default("general"),
                    )
                    .col(
                        ColumnDef::new(Notifications::Read)
                            .boolean()
                            .not_null()
                            .default(false),
                    )
                    .col(
                        ColumnDef::new(Notifications::ActionTaken)
                            .string(),
                    )
                    .col(
                        ColumnDef::new(Notifications::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_notifications_validator_id") // Fixed the name to match what it actually does
                            .from(Notifications::Table, Notifications::ValidatorId)
                            .to(Validators::Table, Validators::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;
            
        // Create indexes separately for better compatibility
        manager
            .create_index(
                Index::create()
                    .name("idx_notifications_validator_id")
                    .table(Notifications::Table)
                    .col(Notifications::ValidatorId)
                    .to_owned(),
            )
            .await?;
            
        manager
            .create_index(
                Index::create()
                    .name("idx_notifications_created_at")
                    .table(Notifications::Table)
                    .col(Notifications::CreatedAt)
                    .to_owned(),
            )
            .await?;
            
        println!("✅ Notifications table created");
        println!("🎉 Migration completed successfully!");
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop indexes first
        manager
            .drop_index(
                Index::drop()
                    .name("idx_notifications_created_at")
                    .to_owned(),
            )
            .await?;
            
        manager
            .drop_index(
                Index::drop()
                    .name("idx_notifications_validator_id")
                    .to_owned(),
            )
            .await?;
            
        manager
            .drop_table(Table::drop().table(Notifications::Table).to_owned())
            .await?;
            
        Ok(())
    }
}

// Only define the Notifications enum since other tables already exist
#[derive(DeriveIden)]
enum Notifications {
    Table,
    Id,
    ValidatorId,
    Title,
    Message,
    NotificationType,
    Read,
    ActionTaken,
    CreatedAt,
}

// Reference existing tables without redefining them
#[derive(DeriveIden)]
enum Validators {
    Table,
    Id,
}