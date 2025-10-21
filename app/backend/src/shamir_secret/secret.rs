use sharks::{Share, Sharks};
use solana_sdk::{signature::{Keypair,Signer}, signer::SeedDerivable};
use anyhow::anyhow;

pub struct SecretConfig{
    pub threshold : u8,
    pub shares : u8
}

impl SecretConfig {
    pub fn default() -> Self{
        Self { threshold: 3, shares: 5 }
    }

    pub fn generate_key_and_split(&self) -> Result<Vec<Share>, anyhow::Error>{
        let keypair = Keypair::new();
        let pubkey = keypair.pubkey();

        let secret_bytes = keypair.to_bytes();
        let shares = self.split_secret(&secret_bytes[0..32])?;
        println!("created keypair and pubkey is : {}", pubkey);
        Ok(shares)
    }

    pub fn split_secret(&self, secret : &[u8]) -> Result<Vec<Share>, anyhow::Error>{
        if self.threshold > self.shares{
            return Err(anyhow!("threshold cannot be greater than total shares"));
        }

        if self.threshold < 2{
            return Err(anyhow!("minimum threshold must be 3"));
        }

        let sharks = Sharks(self.threshold);
        let dealer = sharks.dealer(secret);
        let shares : Vec<Share> = dealer.take(self.shares as usize).collect();

        Ok(shares)
    }

    pub fn reconstruct_secret(shares : &[Share], threshold : u8) -> Result<Keypair, anyhow::Error>{
        if shares.is_empty(){
            return Err(anyhow!("No shares present"));
        }

        if shares.len() < threshold as usize {
            return Err(anyhow!("insufficient shares : got {} need {}", shares.len(), threshold));
        }

        let sharks = Sharks(threshold);
        let secret = sharks.recover(shares).map_err(|e| anyhow::anyhow!("failed to recover secret : {} ", e))?;
        if secret.len() != 32 {
            return Err(anyhow!("Reconstructed secret has invalid length"));
        }
        let mut pvt_key = [0u8 ; 32];
        pvt_key.copy_from_slice(&secret);
        
        let keypair = match Keypair::from_seed(&pvt_key){
            Ok(keypair) => {
                keypair
            }
            Err(e) => {
                return Err(anyhow!("error creating keypair from pvt key : {}",e))
            }
        };

        println!("Succesfully reconstructed keypair");
        println!("Public for keypair is : {}", keypair.pubkey());
        Ok(keypair)
    }
} 