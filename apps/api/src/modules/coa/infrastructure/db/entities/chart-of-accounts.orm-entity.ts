import { Collection } from '@mikro-orm/core';
import { Check, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { AccountOrmEntity } from './account.orm-entity';

@Entity({ tableName: 'chart_of_accounts' })
export class ChartOfAccountsOrmEntity {

    @PrimaryKey({ type: 'uuid' })
    id!: string;

    @Property({ type: 'integer', version: true })
    @Check({ expression: cols => `${cols.version} >=0` })
    version!: number;

    @Property({ type: 'datetime', default: 'CURRENT_TIMESTAMP'})
    updatedAt!: Date;

    @OneToMany(() => AccountOrmEntity, (account) => account.chart, { orphanRemoval: true })
    accounts = new Collection<AccountOrmEntity>(this);
}