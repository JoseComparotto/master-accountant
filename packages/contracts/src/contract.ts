import { initContract } from "@ts-rest/core";
import { accountsContract } from "./modules/accounts/accounts.contract.js";

const c = initContract();

export const apiContract = c.router({
    accounts: accountsContract
})