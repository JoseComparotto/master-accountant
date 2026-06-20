export interface InactivationCheckInput {
    isAlreadyInactive: boolean;
    hasAnyActiveChild: boolean;
}
export interface ActivationCheckInput {
    isAlreadyActive: boolean;
    isParentInactive: boolean;
}

export enum AccountRuleReason {
    ALREADY_INACTIVE = "is already inactive",
    ALREADY_ACTIVE = "is already active",
    HAS_ACTIVE_CHILD = "has active child",
    INACTIVE_PARENT = "parent is inactive",
} 

export type RuleOutput = { can: true, reasons?: undefined } | { can: false, reasons: AccountRuleReason[] };

export function canInactivateAccount(input: InactivationCheckInput): RuleOutput {
    const reasons: AccountRuleReason[] = [];

    if (input.isAlreadyInactive) reasons.push(AccountRuleReason.ALREADY_INACTIVE);
    if (input.hasAnyActiveChild) reasons.push(AccountRuleReason.HAS_ACTIVE_CHILD);

    return reasons.length === 0 ? { can: true } : {
        can: false,
        reasons,
    };
}

export function canActivateAccount(input: ActivationCheckInput): RuleOutput {
    const reasons: AccountRuleReason[] = [];

    if (input.isAlreadyActive) reasons.push(AccountRuleReason.ALREADY_ACTIVE);
    if (input.isParentInactive) reasons.push(AccountRuleReason.INACTIVE_PARENT);

    return reasons.length === 0 ? { can: true } : {
        can: false,
        reasons,
    };
}
