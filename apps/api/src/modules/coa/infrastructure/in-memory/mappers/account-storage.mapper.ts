import { AccountProps, StructuralCodeValue, AccountNameValue, AccountClassEnum, type AccountEntity, BalanceTypeEnum } from "@repo/coa-core"
import { UuidValue } from "@repo/shared-core"
import { AccountDto } from "@repo/coa-contracts"
import { AccountStorageSnapshot } from "../in-memory.database"

export class AccountStorageMapper {
    static toProps(snapshot: AccountStorageSnapshot): AccountProps {
        return {
            chartId: UuidValue.create(snapshot.chartId),
            id: UuidValue.create(snapshot.id),
            structuralCode: StructuralCodeValue.fromSegments(snapshot.structuralCode),
            name: AccountNameValue.create(snapshot.name),
            description: snapshot.description,
            parentId: UuidValue.createOptional(snapshot.parentId) ?? null,
            accountClass: snapshot.accountClass as AccountClassEnum,
            isSummary: snapshot.isSummary,
            isContra: snapshot.isContra,
            isActive: snapshot.isActive
        }
    }
    static toSnapshot(entity: Readonly<AccountEntity>): AccountStorageSnapshot {
        return {
            chartId: entity.chartId.value,
            id: entity.id.value,
            structuralCode: entity.structuralCode.segments,
            name: entity.name.value,
            description: entity.description,
            parentId: entity.parentId?.value ?? null,
            accountClass: entity.accountClass,
            balanceType: entity.balanceType,
            isSummary: entity.isSummary,
            isContra: entity.isContra,
            isActive: entity.isActive,
        }

    }

    static toDto(snapshot: AccountStorageSnapshot): AccountDto {
        const structuralCode = StructuralCodeValue.fromSegments(snapshot.structuralCode);
        return {
            id: snapshot.id,
            parentId: snapshot.parentId,
            name: snapshot.name,
            description: snapshot.description,
            localIndex: structuralCode.localIndex,
            formattedCode: structuralCode.value,
            accountClass: snapshot.accountClass as AccountClassEnum,
            balanceType: snapshot.balanceType as BalanceTypeEnum,
            isContra: snapshot.isContra,
            isSummary: snapshot.isSummary,
            isActive: snapshot.isActive,
        }
    }
}