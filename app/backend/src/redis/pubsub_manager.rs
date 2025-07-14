use crate::types::websocket::ServerMessage;
use futures_util::{Stream, StreamExt};
use redis::{AsyncCommands, Client};


#[derive(Clone, Debug)]
pub struct RedisPubSub {
    pub redis_client: Client,
}

impl RedisPubSub {
    pub async fn publish_to_validators(
        &self,
        message: ServerMessage,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut conn = self.redis_client.get_multiplexed_async_connection().await?;
        let message_json = serde_json::to_string(&message)?;

        let subcribers_count: i32 = conn.publish("validator_notifcation", &message_json).await?; // it contains the amount of subcribers to the channel.
        println!(
            "Published message {} to {} validator subcribers",
            message_json, subcribers_count
        );

        Ok(())
    }

    // creating a pipeline from pub/sub to modify the stream data (filter out bad data).
    pub async fn subscribe_to_notifications(
        &self,
    ) -> Result<impl Stream<Item = ServerMessage>, Box<dyn std::error::Error + Send + Sync>> {
        let mut pubsub = self.redis_client.get_async_pubsub().await?;
        pubsub.subscribe("validator_notification");
        println!("Subscribed to channel to revieve message");

        let stream = pubsub.into_on_message().filter_map(|server_message_raw| {
            async move {
                match server_message_raw.get_payload::<String>() {
                    // get_payload fn extracts the message content sent by publisher and converts it into String (as mentioned by us)
                    Ok(server_message_string) => {
                        // it returns Result<String, Error>
                        println!("String message recieved from the server");
                        match serde_json::from_str::<ServerMessage>(&server_message_string) {
                            Ok(server_message_json) => {
                                println!(
                                    "Parsed server message successfully {:?}",
                                    &server_message_json
                                );
                                Some(server_message_json)
                            }
                            Err(e) => {
                                println!("Error while parcing the message {}", e);
                                None
                            }
                        }
                    }
                    Err(e) => {
                        println!(
                            "Failed to extract the message in string from the server {}",
                            e
                        );
                        None
                    }
                }
            }
        });
        Ok(stream)
    }
}
