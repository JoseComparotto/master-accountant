import { UpdateAccountInput } from "../entities/chart-of-accounts.entity.js";

export const MUTABLE_FIELDS = new Set<keyof UpdateAccountInput>([
    'name',
    'description',
    'isContra',
    'isActive',
]);