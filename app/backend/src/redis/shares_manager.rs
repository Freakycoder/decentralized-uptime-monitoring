use std::collections::HashMap;
use anyhow::anyhow;
use sharks::Share;

pub struct ShareStorage {
    shares: HashMap<String, Share>,
}

impl ShareStorage {
    pub fn store_share(&mut self, public_key: &str, share: Share) {
        self.shares.insert(public_key.to_string(), share);
        println!("Stored share for: {}", public_key);
    }
    
    pub fn retrieve_share(&self, public_key: &str) -> Result<&Share, anyhow::Error> {
        self.shares.get(public_key)
            .ok_or(anyhow!("share not found for : {}", public_key))
    }
}