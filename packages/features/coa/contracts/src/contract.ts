import { initContract } from "@ts-rest/core";
import { coaContract } from "./coa/coa.contracts.js";
import { accountsContract } from "./accounts/accounts.contract.js";

const c = initContract();

export const apiContract = c.router({
    coa: coaContract,
    accounts: accountsContract,
})