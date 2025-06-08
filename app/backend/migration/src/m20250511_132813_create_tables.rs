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
                    .col(
                        ColumnDef::new(Users::PasswordHash)
                            .string()
                            .not_null(),
                    )
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
                    .col(ColumnDef::new(WebsitePerformance::ErrorType).string())
                    .col(ColumnDef::new(WebsitePerformance::ConnectionType).string())
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
                    .col(ColumnDef::new(WebsitePerformance::ContentSizeBytes).integer())
                    .col(ColumnDef::new(WebsitePerformance::ContainsExpectedContent).boolean())
                    .col(ColumnDef::new(WebsitePerformance::Latitude).double())
                    .col(ColumnDef::new(WebsitePerformance::Longitude).double())
                    .col(
                        ColumnDef::new(WebsitePerformance::IsValidated)
                            .boolean()
                            .not_null(),
                    )
                    .to_owned(),
            )
            .await?;
        println!("✅ WebsitePerformance table created");

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
    ErrorType,
    ConnectionType,
    DnsResolutionMs,
    ConnectionTimeMs,
    TlsHandshakeMs,
    TimeToFirstByteMs,
    ContentDownloadMs,
    TotalTimeMs,
    ContentSizeBytes,
    ContainsExpectedContent,
    Latitude,
    Longitude,
    IsValidated,
}