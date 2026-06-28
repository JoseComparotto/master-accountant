export type ToThrowCallback<Reason = AccountRuleReason> = (reasons: [Reason, ...Reason[]]) => Error;

export type AccountRuleReason = 
    | InactivationAccountRuleReason 
    | ActivationAccountRuleReason 
    | ChildCreationRuleReason; 

// 🌟 Helper central para executar as regras e gerenciar exceções
function evaluateRules<T>(reasons: T[], toThrow?: ToThrowCallback<T>): boolean {
    if (reasons.length === 0) return true;
    if (toThrow) throw toThrow(reasons as [T, ...T[]]);
    return false;
}

// --- Inativação ---
export enum InactivationAccountRuleReason {
    HAS_ACTIVE_CHILD = "has active child",
    IS_ROOT_ACCOUNT = "is root account",
}
export interface InactivationCheckInput {
    hasAnyActiveChild: boolean;
    isRootAccount: boolean;
}
export function canInactivateAccount(
    input: InactivationCheckInput,
    toThrow?: ToThrowCallback<InactivationAccountRuleReason>
): boolean {
    const reasons = [
        input.isRootAccount && InactivationAccountRuleReason.IS_ROOT_ACCOUNT,
        input.hasAnyActiveChild && InactivationAccountRuleReason.HAS_ACTIVE_CHILD
    ].filter(Boolean) as InactivationAccountRuleReason[];

    return evaluateRules(reasons, toThrow);
}

// --- Ativação ---
export enum ActivationAccountRuleReason {
    INACTIVE_PARENT = "parent is inactive",
}
export interface ActivationCheckInput {
    isParentInactive: boolean;
}
export function canActivateAccount(
    input: ActivationCheckInput,
    toThrow?: ToThrowCallback<ActivationAccountRuleReason>
): boolean {
    const reasons = [
        input.isParentInactive && ActivationAccountRuleReason.INACTIVE_PARENT
    ].filter(Boolean) as ActivationAccountRuleReason[];

    return evaluateRules(reasons, toThrow);
}

// --- Criação de Filho ---
export enum ChildCreationRuleReason {
    NOT_SUMMARY_ACCOUNT = "is not summary account",
    INACTIVE_ACCOUNT = 'is inactive account'
}
export interface ChildCreationCheckInput {
    isActive: boolean;
    isSummary: boolean;
}
export function canCreateChild(
    input: ChildCreationCheckInput,
    toThrow?: ToThrowCallback<ChildCreationRuleReason>
): boolean {
    const reasons = [
        !input.isActive && ChildCreationRuleReason.INACTIVE_ACCOUNT,
        !input.isSummary && ChildCreationRuleReason.NOT_SUMMARY_ACCOUNT
    ].filter(Boolean) as ChildCreationRuleReason[];

    return evaluateRules(reasons, toThrow);
}