import { generateOpenApi } from "@ts-rest/open-api";
import { apiContract } from "./contract.js";

export const openApiDocument = generateOpenApi(apiContract, {
  info: {
    title: 'Master Accountant API',
    version: '0.0.1',
  },
});