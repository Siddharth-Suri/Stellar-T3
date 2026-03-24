#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol};

const YES: Symbol = symbol_short!("YES");
const NO:  Symbol = symbol_short!("NO");

#[contract]
pub struct PollContract;

#[contractimpl]
impl PollContract {
    pub fn vote(env: Env, option: Symbol) {
        let key = if option == YES { YES } else { NO };
        let count: u32 = env.storage().instance().get(&key).unwrap_or(0);
        env.storage().instance().set(&key, &(count + 1));
        env.events().publish((symbol_short!("vote"),), (option, count + 1));
    }

    pub fn get_results(env: Env) -> (u32, u32) {
        let yes: u32 = env.storage().instance().get(&YES).unwrap_or(0);
        let no:  u32 = env.storage().instance().get(&NO).unwrap_or(0);
        (yes, no)
    }
}
