use anchor_lang::prelude::*;

declare_id!("UMUmkqXqujVtpUrSKsYb9QcVmJprPPNsGePF89HtH9i");

#[program]
pub mod iot_register {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
