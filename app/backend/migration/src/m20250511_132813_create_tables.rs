use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Users::Table)
                    .if_not_exists()
                    .col(uuid(Users::Id).primary_key())
                    .col(string(Users::Email).unique_key())
                    .col(string(Users::PasswordHash))
                    .col(
                        timestamp_with_time_zone_null(Users::CreatedAt)
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table(Validators::Table)
                    .if_not_exists()
                    .col(uuid(Validators::Id).primary_key())
                    .col(string(Validators::UserId).unique_key())
                    .col(string(Validators::WalletAddress).unique_key())
                    .col(double_null(Validators::Latitude))
                    .col(double_null(Validators::Longitude))
                    .col(string(Validators::DeviceId).unique_key())
                    .col(
                        timestamp_with_time_zone_null(Validators::CreatedAt)
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table(WebsiteRegister::Table)
                    .if_not_exists()
                    .col(uuid(WebsiteRegister::Id).primary_key())
                    .col(string(WebsiteRegister::WebsiteUrl).unique_key())
                    .col(string(WebsiteRegister::UserId))
                    .col(
                        timestamp_with_time_zone(WebsiteRegister::Timestamp)
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table(WebsitePerformance::Table)
                    .if_not_exists()
                    .col(uuid(WebsitePerformance::Id).primary_key())
                    .col(string(WebsitePerformance::ValidatorId))
                    .col(uuid(WebsitePerformance::WebsiteId))
                    .col(timestamp_with_time_zone(WebsitePerformance::Timestamp))
                    .col(integer_null(WebsitePerformance::HttpStatusCode))
                    .col(string_null(WebsitePerformance::ErrorType))
                    .col(string_null(WebsitePerformance::ConnectionType))
                    .col(integer_null(WebsitePerformance::DnsResolutionMs))
                    .col(integer_null(WebsitePerformance::ConnectionTimeMs))
                    .col(integer_null(WebsitePerformance::TlsHandshakeMs))
                    .col(integer_null(WebsitePerformance::TimeToFirstByteMs))
                    .col(integer_null(WebsitePerformance::ContentDownloadMs))
                    .col(integer(WebsitePerformance::TotalTimeMs))
                    .col(integer_null(WebsitePerformance::ContentSizeBytes))
                    .col(boolean_null(WebsitePerformance::ContainsExpectedContent))
                    .col(double_null(WebsitePerformance::Latitude))
                    .col(double_null(WebsitePerformance::Longitude))
                    .col(boolean(WebsitePerformance::IsValidated))
                    .to_owned(),
            )
            .await?;

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
