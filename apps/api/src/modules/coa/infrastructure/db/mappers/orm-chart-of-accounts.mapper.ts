import { ChartOfAccountsEntity, AccountEntity, AccountProps, AccountNameValue, StructuralCodeValue, VersionValue } from '@repo/coa-core';
import { ChartOfAccountsOrmEntity } from '../entities/chart-of-accounts.orm-entity';
import { AccountOrmEntity } from '../entities/account.orm-entity';
import { UuidValue } from '@repo/shared-core';

export class OrmChartOfAccountsMapper {

    static toDomain(ormEntity: ChartOfAccountsOrmEntity): ChartOfAccountsEntity {
        const accountProps = ormEntity.accounts.map<AccountProps>((accountOrm) => ({
            chartId: UuidValue.create(accountOrm.chart.id),
            parentId: UuidValue.createOptional(accountOrm.parent?.id) ?? null,

            id: UuidValue.create(accountOrm.id),
            name: AccountNameValue.create(accountOrm.name),
            structuralCode: StructuralCodeValue.fromSegments(accountOrm.codeSegments),
            description: accountOrm.description,
            accountClass: accountOrm.accountClass,
            isSummary: accountOrm.isSummary,
            isContra: accountOrm.isContra,
            isActive: accountOrm.isActive,
        }));

        return ChartOfAccountsEntity.reconstitute(
            accountProps,
            VersionValue.create(ormEntity.version),
        );
    }

    static toPersistence(domainAggregate: ChartOfAccountsEntity, ormEntity: ChartOfAccountsOrmEntity): void {
        ormEntity.version = domainAggregate.version.value;
        ormEntity.updatedAt = new Date();

        const ormAccountsMap = new Map<string, AccountOrmEntity>();

        const updatedAccountsOrm = domainAggregate.accounts.map((domainAccount) => {
            const accountOrm = new AccountOrmEntity();
            accountOrm.id = domainAccount.id.value;
            accountOrm.name = domainAccount.name.value;
            accountOrm.description = domainAccount.description;
            accountOrm.codeSegments = domainAccount.structuralCode.segments;
            accountOrm.accountClass = domainAccount.accountClass;
            accountOrm.isSummary = domainAccount.isSummary;
            accountOrm.isContra = domainAccount.isContra;
            accountOrm.isActive = domainAccount.isActive;
            accountOrm.chart = ormEntity;

            ormAccountsMap.set(accountOrm.id, accountOrm);
            return accountOrm;
        });

        domainAggregate.accounts.forEach((domainAccount) => {
            if (domainAccount.parentId) {
                const currentOrm = ormAccountsMap.get(domainAccount.id.value);
                const parentOrm = ormAccountsMap.get(domainAccount.parentId.value);

                if (currentOrm && parentOrm) {
                    currentOrm.parent = parentOrm;
                }
            }
        });

        ormEntity.accounts.set(updatedAccountsOrm);
    }
}