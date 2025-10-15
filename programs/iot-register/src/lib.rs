use anchor_lang::prelude::*;
use serde::Serialize;

declare_id!("UMUmkqXqujVtpUrSKsYb9QcVmJprPPNsGePF89HtH9i");

#[program]
pub mod iot_register {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, seeds : &str, ) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts, Debug)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault", admin]
    )]
    pub vault : Account<'info, Vault>,
    pub admin : Signer<'info>,
    pub system_program : SystemAccount<'info>,
}

#[account]
#[derive(InitSpace ,Debug)]
pub struct Vault{
    pub admin : Pubkey,
    pub operator : Pubkey,
    pub fee_account : Pubkey,
    pub total_deposited : u64,
    pub total_withdrawn : u64,
    pub withdrawal_fee_bps : u16,
    pub last_admin_withdrawal : i64,
    pub is_paused : bool,
    pub withdrawal_counter : u64,
    pub bump : u8
}
