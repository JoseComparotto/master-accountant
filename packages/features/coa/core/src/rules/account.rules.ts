export interface InactivationCheckInput {
    hasAnyActiveChild: boolean;
    isRootAccount: boolean;
}
export interface ActivationCheckInput {
    isParentInactive: boolean;
}

export enum AccountRuleReason {
    HAS_ACTIVE_CHILD = "has active child",
    INACTIVE_PARENT = "parent is inactive",
    IS_ROOT_ACCOUNT = "is root account",
}

export type ToThrowCallback = (reasons: AccountRuleReason[]) => Error;

export function canInactivateAccount(
    input: InactivationCheckInput,
    toThrow?: ToThrowCallback
): boolean | never {
    const reasons: AccountRuleReason[] = [];

    if (input.isRootAccount) reasons.push(AccountRuleReason.IS_ROOT_ACCOUNT);
    if (input.hasAnyActiveChild) reasons.push(AccountRuleReason.HAS_ACTIVE_CHILD);

    const can = reasons.length === 0;
    if (!can && toThrow) throw toThrow(reasons);
    return can;
}

export function canActivateAccount(
    input: ActivationCheckInput,
    toThrow?: ToThrowCallback
): boolean {
    const reasons: AccountRuleReason[] = [];

    if (input.isParentInactive) reasons.push(AccountRuleReason.INACTIVE_PARENT);

    const can = reasons.length === 0;
    if (!can && toThrow) throw toThrow(reasons);
    return can;
}
