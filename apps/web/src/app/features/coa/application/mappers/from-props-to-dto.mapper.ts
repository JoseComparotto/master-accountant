import { ReplaceAccountsInputDto } from "@repo/coa-contracts";
import { AccountEntity, AccountProps } from "@repo/coa-core";

export function fromPropsToDto(props: AccountProps): ReplaceAccountsInputDto[number] {
    return {
        id: props.id.value,
        parentId: props.parentId?.value ?? null,
        name: props.name.value,
        description: props.description,
        accountClass: props.accountClass,
        localIndex: props.structuralCode.localIndex,
        isSummary:props.isSummary,
        isContra:props.isContra,
        isActive: props.isActive,
    }
}
export function fromDomainToDto(domain: Readonly<AccountEntity>): ReplaceAccountsInputDto[number]  {
    return fromPropsToDto(domain.toProps())
}