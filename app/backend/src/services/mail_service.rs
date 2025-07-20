use sendgrid::v3::{
    Content, Email, Mail, Message, Personalization, Sender,
};
use std::env;

#[derive(Clone)]
pub struct EmailService {
    sender: Sender,
    from_email: String,
    from_name: String,
}

impl EmailService {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let api_key = env::var("SENDGRID_API_KEY")
            .map_err(|_| "SENDGRID_API_KEY environment variable must be set")?;
        
        let from_email = env::var("SENDGRID_FROM_EMAIL")
            .unwrap_or_else(|_| "noreply@datacontrib.com".to_string());
        
        let from_name = env::var("SENDGRID_FROM_NAME")
            .unwrap_or_else(|_| "DataContrib".to_string());

        let sender = Sender::new(api_key);
        
        Ok(Self {
            sender,
            from_email,
            from_name,
        })
    }

    pub async fn send_validator_welcome(
        &self,
        email: &str,
        validator_id: &str,
        user_name: Option<&str>,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        println!("📧 Sending welcome email to: {}", email);

        let from = Email::new(&self.from_email)
            .set_name(&self.from_name);
        
        let to = Email::new(email)
            .set_name(user_name.unwrap_or("Validator"));

        let subject = "🎉 Welcome to DataContrib Validator Network!";
        
        let html_content = format!(
            r#"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to DataContrib</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">🚀 Welcome to DataContrib!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">You're now a validator in our network</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                    <h2 style="color: #495057; margin-top: 0;">🎯 Your Validator Details</h2>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Validator ID:</strong></p>
                        <code style="background: #e9ecef; padding: 8px 12px; border-radius: 4px; font-family: monospace; display: inline-block; margin-top: 5px; font-size: 14px;">{}</code>
                    </div>

                    <h3 style="color: #495057;">🚀 What's Next?</h3>
                    <ul style="padding-left: 0; list-style: none;">
                        <li style="margin: 10px 0; padding: 10px; background: white; border-radius: 6px; border-left: 3px solid #28a745;">
                            ✅ <strong>Connect your Solana wallet</strong> - Start receiving rewards
                        </li>
                        <li style="margin: 10px 0; padding: 10px; background: white; border-radius: 6px; border-left: 3px solid #17a2b8;">
                            🌐 <strong>Monitor websites</strong> - Accept monitoring tasks from your dashboard
                        </li>
                        <li style="margin: 10px 0; padding: 10px; background: white; border-radius: 6px; border-left: 3px solid #ffc107;">
                            💰 <strong>Earn SOL rewards</strong> - Get paid for every successful monitoring session
                        </li>
                    </ul>

                    <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <h4 style="color: #0c5460; margin-top: 0;">💡 Pro Tips:</h4>
                        <ul style="color: #0c5460; margin: 0; padding-left: 20px;">
                            <li>Keep your browser extension installed for automatic monitoring</li>
                            <li>Check your dashboard regularly for new monitoring tasks</li>
                            <li>Maintain a stable internet connection for better earnings</li>
                        </ul>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://datacontrib.com/dashboard" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            🚀 Go to Dashboard
                        </a>
                    </div>

                    <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
                    
                    <p style="color: #6c757d; font-size: 14px; text-align: center; margin: 0;">
                        Questions? Reply to this email or visit our <a href="https://datacontrib.com/support" style="color: #667eea;">support center</a>.
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
                    <p>This email was sent by DataContrib. You're receiving this because you registered as a validator.</p>
                </div>
            </body>
            </html>
            "#,
            validator_id
        );

        let text_content = format!(
            r#"
Welcome to DataContrib Validator Network! 🎉

Your Validator ID: {}

What's Next:
✅ Connect your Solana wallet
🌐 Start monitoring websites  
💰 Earn SOL rewards automatically

Visit your dashboard: https://datacontrib.com/dashboard

Happy validating!
The DataContrib Team
            "#,
            validator_id
        );

        let mail = Mail::new(
            from,
            subject,
            to,
            Content::new()
                .set_content_type("text/html")
                .set_value(&html_content),
        )
        .add_content(
            Content::new()
                .set_content_type("text/plain") 
                .set_value(&text_content),
        );

        match self.sender.send(&mail).await {
            Ok(response) => {
                println!("✅ Welcome email sent successfully. Response: {:?}", response.status());
                Ok(())
            }
            Err(e) => {
                println!("❌ Failed to send welcome email: {:?}", e);
                Err(Box::new(e))
            }
        }
    }

    pub async fn send_monitoring_alert(
        &self,
        email: &str,
        website_url: &str,
        status: &str,
        response_time: Option<u32>,
        error_details: Option<&str>,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        println!("🚨 Sending monitoring alert to: {} for {}", email, website_url);

        let from = Email::new(&self.from_email)
            .set_name("DataContrib Alerts");
        
        let to = Email::new(email);

        let (subject, emoji, color, status_text) = match status {
            "down" => ("🚨 Website Down Alert", "🚨", "#dc3545", "DOWN"),
            "degraded" => ("⚠️ Website Performance Alert", "⚠️", "#ffc107", "DEGRADED"),
            "recovered" => ("✅ Website Recovered", "✅", "#28a745", "RECOVERED"),
            _ => ("📊 Website Status Update", "📊", "#6f42c1", "UNKNOWN"),
        };

        let response_time_text = response_time
            .map(|rt| format!("Response Time: {}ms", rt))
            .unwrap_or_else(|| "Response Time: N/A".to_string());

        let error_section = if let Some(error) = error_details {
            format!(
                r#"
                <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <h4 style="color: #721c24; margin-top: 0;">Error Details:</h4>
                    <code style="color: #721c24; font-family: monospace; font-size: 14px;">{}</code>
                </div>
                "#,
                error
            )
        } else {
            String::new()
        };

        let html_content = format!(
            r#"
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: {}; color: white; padding: 25px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">{} Website Alert</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Monitoring Alert from DataContrib</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 25px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
                    <h2 style="color: #495057; margin-top: 0;">Alert Details</h2>
                    
                    <div style="background: white; padding: 20px; border-radius: 6px; margin: 15px 0;">
                        <p style="margin: 5px 0;"><strong>Website:</strong> <a href="{}" style="color: #007bff; text-decoration: none;">{}</a></p>
                        <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: {}; font-weight: bold;">{}</span></p>
                        <p style="margin: 5px 0;"><strong>Time:</strong> {}</p>
                        <p style="margin: 5px 0;"><strong>{}</strong></p>
                    </div>
                    
                    {}
                    
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="https://datacontrib.com/dashboard" style="background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                            View Dashboard
                        </a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #dee2e6; margin: 25px 0;">
                    
                    <p style="color: #6c757d; font-size: 14px; text-align: center; margin: 0;">
                        This alert was generated by the DataContrib monitoring network.
                    </p>
                </div>
            </body>
            </html>
            "#,
            color, emoji, website_url, website_url, color, status_text,
            chrono::Utc::now().format("%Y-%m-%d %H:%M:%S UTC"),
            response_time_text, error_section
        );

        let mail = Mail::new(
            from,
            &format!("{} - {}", subject, website_url),
            to,
            Content::new()
                .set_content_type("text/html")
                .set_value(&html_content),
        );

        match self.sender.send(&mail).await {
            Ok(response) => {
                println!("✅ Alert email sent successfully. Response: {:?}", response.status());
                Ok(())
            }
            Err(e) => {
                println!("❌ Failed to send alert email: {:?}", e);
                Err(Box::new(e))
            }
        }
    }

    pub async fn send_weekly_report(
        &self,
        email: &str,
        validator_id: &str,
        earnings: f64,
        sites_monitored: u32,
        uptime_percentage: f64,
        rank: Option<u32>,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        println!("📊 Sending weekly report to: {}", email);

        let from = Email::new(&self.from_email)
            .set_name("DataContrib Reports");
        
        let to = Email::new(email);

        let rank_section = if let Some(r) = rank {
            format!(
                r#"
                <div style="text-align: center; background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <h4 style="color: #856404; margin: 0;">🏆 Your Validator Rank: #{}</h4>
                    <p style="color: #856404; margin: 5px 0 0 0; font-size: 14px;">Out of all active validators</p>
                </div>
                "#,
                r
            )
        } else {
            String::new()
        };

        let html_content = format!(
            r#"
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">📊 Weekly Validator Report</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your performance summary</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                    {}
                    
                    <h2 style="color: #495057; margin-top: 0;">📈 This Week's Performance</h2>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0;">
                        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #28a745;">
                            <div style="font-size: 24px; font-weight: bold; color: #28a745; margin-bottom: 5px;">{:.4} SOL</div>
                            <div style="color: #6c757d; font-size: 14px;">Earned This Week</div>
                        </div>
                        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #007bff;">
                            <div style="font-size: 24px; font-weight: bold; color: #007bff; margin-bottom: 5px;">{}</div>
                            <div style="color: #6c757d; font-size: 14px;">Sites Monitored</div>
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin-top: 0; color: #495057;">⚡ Uptime Performance</h4>
                        <div style="background: #e9ecef; height: 20px; border-radius: 10px; overflow: hidden;">
                            <div style="background: #28a745; height: 100%; width: {}%; border-radius: 10px;"></div>
                        </div>
                        <p style="text-align: center; margin: 10px 0 0 0; font-weight: bold; color: #495057;">{:.1}% Uptime</p>
                    </div>

                    <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <h4 style="color: #0c5460; margin-top: 0;">🚀 Keep It Up!</h4>
                        <p style="color: #0c5460; margin: 0;">Your consistent monitoring helps maintain internet reliability. Every check contributes to the network's health!</p>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://datacontrib.com/dashboard" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            📊 View Full Dashboard
                        </a>
                    </div>

                    <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef;">
                        <p style="margin: 0; font-size: 14px; color: #6c757d;">
                            <strong>Validator ID:</strong> <code style="background: #f8f9fa; padding: 2px 6px; border-radius: 3px; font-family: monospace;">{}</code>
                        </p>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
                    <p>This report was generated by DataContrib. <a href="https://datacontrib.com/unsubscribe" style="color: #6c757d;">Unsubscribe</a></p>
                </div>
            </body>
            </html>
            "#,
            rank_section, earnings, sites_monitored, uptime_percentage, uptime_percentage, validator_id
        );

        let mail = Mail::new(
            from,
            "📊 Your Weekly DataContrib Report",
            to,
            Content::new()
                .set_content_type("text/html")
                .set_value(&html_content),
        );

        match self.sender.send(&mail).await {
            Ok(response) => {
                println!("✅ Weekly report sent successfully. Response: {:?}", response.status());
                Ok(())
            }
            Err(e) => {
                println!("❌ Failed to send weekly report: {:?}", e);
                Err(Box::new(e))
            }
        }
    }

    pub async fn send_password_reset(
        &self,
        email: &str,
        reset_token: &str,
        expires_in_minutes: u32,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        println!("🔐 Sending password reset email to: {}", email);

        let from = Email::new(&self.from_email)
            .set_name("DataContrib Security");
        
        let to = Email::new(email);

        let reset_url = format!("https://datacontrib.com/reset-password?token={}", reset_token);

        let html_content = format!(
            r#"
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #dc3545; color: white; padding: 25px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">🔐 Password Reset Request</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">DataContrib Account Security</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 25px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
                    <p>We received a request to reset your DataContrib account password.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{}" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            🔐 Reset Password
                        </a>
                    </div>
                    
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <p style="margin: 0; color: #856404;"><strong>⚠️ Important:</strong></p>
                        <ul style="color: #856404; margin: 10px 0 0 0;">
                            <li>This link expires in {} minutes</li>
                            <li>If you didn't request this reset, please ignore this email</li>
                            <li>Your password won't change until you click the link above</li>
                        </ul>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #dee2e6; margin: 25px 0;">
                    
                    <p style="color: #6c757d; font-size: 14px;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="{}" style="color: #007bff; word-break: break-all;">{}</a>
                    </p>
                    
                    <p style="color: #6c757d; font-size: 14px; text-align: center; margin-top: 25px;">
                        If you have questions, contact our support team at support@datacontrib.com
                    </p>
                </div>
            </body>
            </html>
            "#,
            reset_url, expires_in_minutes, reset_url, reset_url
        );

        let mail = Mail::new(
            from,
            "🔐 Reset Your DataContrib Password",
            to,
            Content::new()
                .set_content_type("text/html")
                .set_value(&html_content),
        );

        match self.sender.send(&mail).await {
            Ok(response) => {
                println!("✅ Password reset email sent successfully. Response: {:?}", response.status());
                Ok(())
            }
            Err(e) => {
                println!("❌ Failed to send password reset email: {:?}", e);
                Err(Box::new(e))
            }
        }
    }
}