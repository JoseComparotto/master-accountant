import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany
} from '@mikro-orm/decorators/legacy';
import { Collection } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { AccountNode } from './account-node.entity';

@Entity({schema: 'coa'})
export class ChartOfAccounts {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  name!: string;

  @Property({ columnType: 'integer[]' })
  levelWidths!: number[]; // Ex: [1, 1, 2, 3]

  @OneToMany(() => AccountNode, node => node.chartOfAccounts)
  nodes = new Collection<AccountNode>(this);

  @Property({ default: true })
  isActive: boolean = true;

  constructor(name: string, levelWidths: number[]) {
    this.name = name;
    this.levelWidths = levelWidths;
  }

  // O getter apenas devolve a máscara visual usando o ponto fixo.
  get stringMask(): string {
    return this.levelWidths.map(w => '9'.repeat(w)).join('.');
  }
}