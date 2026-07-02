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

// --- Edição ---
export enum EditRuleReason {
    IS_ROOT_ACCOUNT = "is root account",
}
export interface EditCheckInput {
    isRootAccount: boolean;
}
export function canEdit(
    input: EditCheckInput,
    toThrow?: ToThrowCallback<EditRuleReason>
): boolean {
    const reasons = [
        input.isRootAccount && EditRuleReason.IS_ROOT_ACCOUNT,
    ].filter(Boolean) as EditRuleReason[];

    return evaluateRules(reasons, toThrow);
}

// --- Conversão para Contra ---
export enum ConvertToContraRuleReason {
    HAS_NORMAL_CHILD = "has normal child",
}
export interface ConvertToContraCheckInput {
    hasNormalChild: boolean;
}
export function canConvertToContra(
    input: ConvertToContraCheckInput,
    toThrow?: ToThrowCallback<ConvertToContraRuleReason>
) {
    const reasons = [
        input.hasNormalChild && ConvertToContraRuleReason.HAS_NORMAL_CHILD,
    ].filter(Boolean) as ConvertToContraRuleReason[];
    return evaluateRules(reasons, toThrow);
}

// --- Conversão para Normal ---
export enum ConvertToNormalRuleReason {
    PARENT_IS_CONTRA = "parent is contra",
}
export interface ConvertToNormalCheckInput {
    isParentContra: boolean;
}
export function canConvertToNormal(
    input: ConvertToNormalCheckInput,
    toThrow?: ToThrowCallback<ConvertToNormalRuleReason>
) {
    const reasons = [
        input.isParentContra && ConvertToNormalRuleReason.PARENT_IS_CONTRA,
    ].filter(Boolean) as ConvertToNormalRuleReason[];
    return evaluateRules(reasons, toThrow);
}