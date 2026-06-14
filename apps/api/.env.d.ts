import { UUID } from "node:crypto";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
        PORT: `${number}`,
        GLOBAL_PREFIX: `/${string}`,
        DEFAULT_CHART_ID: UUID,
        MOCK_AUTO_SEED: `${boolean}`
    }
  }
}

export {}