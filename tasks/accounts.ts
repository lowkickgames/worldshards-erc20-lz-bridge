import { task } from "hardhat/config";

task("task:accounts", "Prints accounts and their balances", async (_, { ethers }) => {
    const accounts = await ethers.getSigners();
  
    let balance;
    for (const account of accounts) {
      balance = await ethers.provider.getBalance(account.address);
      console.log(account.address + ":", balance.toString());
    }
  });