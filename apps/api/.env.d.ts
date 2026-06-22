import { UUID } from "node:crypto";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
        PORT: `${number}`,
        GLOBAL_PREFIX: `/${string}`,
        DEFAULT_CHART_ID: UUID,
        DATABASE_URL: string,
        SEED_ACCOUNTS: `${boolean}` | undefined
    }
  }
}

export {}