import { Check, Entity, Enum, Formula, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { ChartOfAccountsOrmEntity } from "./chart-of-accounts.orm-entity";
import { ArrayType, Collection, quote, type Rel } from "@mikro-orm/core";
import { AccountClassEnum, BalanceTypeEnum } from "@repo/coa-core";

@Entity({ tableName: 'accounts' })
export class AccountOrmEntity {

    @PrimaryKey({ type: 'uuid' })
    id!: string;

    @Property({ type: 'varchar(100)' })
    @Check({ expression: cols => `length(${cols.name}) between 3 and 100` })
    name!: string;

    @Property({ type: 'text', nullable: true })
    description!: string | null;

    @Property({ type: 'json' })
    codeSegments!: number[];

    @Enum({ items: () => AccountClassEnum })
    accountClass!: AccountClassEnum;

    @Enum({
        items: () => BalanceTypeEnum,
        generated: cols => `(
            CASE 
                WHEN (
                    ${cols.accountClass!} IN (
                        '${AccountClassEnum.ASSET}',
                        '${AccountClassEnum.EXPENSE}'
                    )
                ) != ${cols.isContra!}
                THEN '${BalanceTypeEnum.DEBIT}'
                ELSE '${BalanceTypeEnum.CREDIT}'
            END
        ) STORED`
    })
    balanceType!: BalanceTypeEnum;

    @Property()
    isSummary!: boolean;

    @Property()
    isContra!: boolean;

    @Property()
    isActive!: boolean;

    @ManyToOne(() => ChartOfAccountsOrmEntity, {
        inversedBy: 'accounts',
    })
    chart!: Rel<ChartOfAccountsOrmEntity>;

    @ManyToOne(() => AccountOrmEntity, {
        inversedBy: 'children',
        nullable: true
    })
    parent!: Rel<AccountOrmEntity> | null;

    @OneToMany(() => AccountOrmEntity, (account) => account.parent, { orphanRemoval: true })
    children = new Collection<AccountOrmEntity>(this);

}