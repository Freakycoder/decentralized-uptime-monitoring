use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        println!("🔄 Creating Users table...");
        // Create Users table first (referenced by other tables)
        manager
            .create_table(
                Table::create()
                    .table(Users::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Users::Id)
                            .uuid()
                            .not_null()
                            .primary_key()
                            .default(Expr::cust("gen_random_uuid()")),
                    )
                    .col(
                        ColumnDef::new(Users::Email)
                            .string()
                            .not_null()
                            .unique_key(),
                    )
                    .col(ColumnDef::new(Users::PasswordHash).string().not_null())
                    .col(
                        ColumnDef::new(Users::CreatedAt)
                            .timestamp_with_time_zone()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;
        println!("✅ Users table created");

        println!("🔄 Creating Validators table...");
        // Create Validators table
        manager
            .create_table(
                Table::create()
                    .table(Validators::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Validators::Id)
                            .uuid()
                            .not_null()
                            .primary_key()
                            .default(Expr::cust("gen_random_uuid()")), // ✅ Fixed: Use PostgreSQL's UUID generator
                    )
                    .col(
                        ColumnDef::new(Validators::UserId)
                            .uuid()
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(Validators::WalletAddress)
                            .string()
                            .not_null()
                            .unique_key(),
                    )
                    .col(ColumnDef::new(Validators::Latitude).double())
                    .col(ColumnDef::new(Validators::Longitude).double())
                    .col(
                        ColumnDef::new(Validators::DeviceId)
                            .string()
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(Validators::CreatedAt)
                            .timestamp_with_time_zone()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;
        println!("✅ Validators table created");

        println!("🔄 Creating WebsiteRegister table...");
        // Create WebsiteRegister table
        manager
            .create_table(
                Table::create()
                    .table(WebsiteRegister::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(WebsiteRegister::Id)
                            .uuid()
                            .not_null()
                            .primary_key()
                            .default(Expr::cust("gen_random_uuid()")), // ✅ Fixed: Use PostgreSQL's UUID generator
                    )
                    .col(
                        ColumnDef::new(WebsiteRegister::WebsiteUrl)
                            .string()
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(WebsiteRegister::UserId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(WebsiteRegister::Timestamp)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;
        println!("✅ WebsiteRegister table created");

        println!("🔄 Creating WebsitePerformance table...");
        // Create WebsitePerformance table
        manager
            .create_table(
                Table::create()
                    .table(WebsitePerformance::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(WebsitePerformance::Id)
                            .uuid()
                            .not_null()
                            .primary_key()
                            .default(Expr::cust("gen_random_uuid()")), // ✅ Fixed: Use PostgreSQL's UUID generator
                    )
                    .col(
                        ColumnDef::new(WebsitePerformance::ValidatorId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(WebsitePerformance::WebsiteId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(WebsitePerformance::Timestamp)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .col(ColumnDef::new(WebsitePerformance::HttpStatusCode).integer())
                    .col(ColumnDef::new(WebsitePerformance::DnsResolutionMs).integer())
                    .col(ColumnDef::new(WebsitePerformance::ConnectionTimeMs).integer())
                    .col(ColumnDef::new(WebsitePerformance::TlsHandshakeMs).integer())
                    .col(ColumnDef::new(WebsitePerformance::TimeToFirstByteMs).integer())
                    .col(ColumnDef::new(WebsitePerformance::ContentDownloadMs).integer())
                    .col(
                        ColumnDef::new(WebsitePerformance::TotalTimeMs)
                            .integer()
                            .not_null(),
                    )
                    .to_owned(),
            )
            .await?;
        println!("✅ WebsitePerformance table created");

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
                            .name("fk_notifications_user_id")
                            .from(Notifications::Table, Notifications::ValidatorId)
                            .to(Validators::Table, Validators::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .index(
                        Index::create()
                            .name("idx_notifications_user_id")
                            .col(Notifications::ValidatorId),
                    )
                    .index(
                        Index::create()
                            .name("idx_notifications_created_at")
                            .col(Notifications::CreatedAt),
                    )
                    .to_owned(),
            )
            .await?;
            
        println!("✅ Notifications table created");

        println!("🎉 All tables created successfully!");
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(WebsitePerformance::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(WebsiteRegister::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Validators::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Users::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Notifications::Table).to_owned())
            .await?;
        Ok(())
    }
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
    Email,
    PasswordHash,
    CreatedAt,
}

#[derive(DeriveIden)]
enum Validators {
    Table,
    Id,
    UserId,
    WalletAddress,
    Latitude,
    Longitude,
    DeviceId,
    CreatedAt,
}

#[derive(DeriveIden)]
enum WebsiteRegister {
    Table,
    Id,
    WebsiteUrl,
    UserId,
    Timestamp,
}

#[derive(DeriveIden)]
enum WebsitePerformance {
    Table,
    Id,
    ValidatorId,
    WebsiteId,
    Timestamp,
    HttpStatusCode,
    DnsResolutionMs,
    ConnectionTimeMs,
    TlsHandshakeMs,
    TimeToFirstByteMs,
    ContentDownloadMs,
    TotalTimeMs
}
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