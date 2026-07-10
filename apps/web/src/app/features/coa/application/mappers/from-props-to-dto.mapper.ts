import { AccountEntity, AccountProps } from "@repo/coa-core";
import { ReplaceAccountInputDto } from "../../infrastructure/dtos/coa.dto";

export function fromPropsToDto(props: AccountProps): ReplaceAccountInputDto {
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
export function fromDomainToDto(domain: Readonly<AccountEntity>): ReplaceAccountInputDto  {
    return fromPropsToDto(domain.toProps())
}