import { AccountNameValue, AccountProps, StructuralCodeValue } from "@repo/coa-core";
import { UuidValue } from "@repo/shared-core";
import { AccountDto } from "../../infrastructure/dtos/coa.dto";

export function fromDtoToProps(dto: AccountDto): AccountProps {
    return {
        ...dto,
        id: UuidValue.create(dto.id),
        parentId: UuidValue.createOptional(dto.parentId) ?? null,
        structuralCode: StructuralCodeValue.fromString(dto.formattedCode),
        name: AccountNameValue.create(dto.name),
    }
}