import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne
} from '@mikro-orm/decorators/legacy';
import type { Rel } from '@mikro-orm/core';
import { v4 } from 'uuid';

import { AccountNode } from './account-node.entity';
import { AccountChangeset } from './account-changeset.entity';
import { AccountClass } from '@modules/chart-of-accounts/domain/enumns/account-class.enum';
import { AccountBalanceType  } from '@modules/chart-of-accounts/domain/enumns/account-balance-type.enum';

@Entity({schema: 'coa'})
export class AccountSnapshot {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  // 1. Ligações de Identidade e Controle
  @ManyToOne(() => AccountNode)
  node!: Rel<AccountNode>;

  @ManyToOne(() => AccountChangeset)
  changeset!: Rel<AccountChangeset>;

  // A "Linked List" Temporal: Aponta para a versão anterior da mesma conta (se houver)
  @ManyToOne(() => AccountSnapshot, { nullable: true })
  previousSnapshot?: Rel<AccountSnapshot>;

  // 2. Dados de Negócio (A Semântica)
  @Property()
  name!: string;

  @Property({ type: 'string' })
  balanceType!: AccountBalanceType;

  @Property({ type: 'string' })
  accountClass!: AccountClass 

  @Property({ nullable: true })
  changeReason?: string; // Ex: "Correção ortográfica"

  // 3. O Eixo Bitemporal
  @Property()
  createdAt: Date = new Date(); // Tempo do Sistema: Quando este registro foi salvo no banco

  // Desnormalização para leitura super rápida de auditoria/balanço
  // Só recebe valor quando o Changeset for publicado (Status = 'published')
  @Property({ type: 'date', nullable: true })
  effectiveDate?: Date;

  constructor(
    node: Rel<AccountNode>,
    changeset: Rel<AccountChangeset>,
    name: string,
    balanceType: AccountBalanceType,
    groupType: AccountClass,
    changeReason?: string,
    previousSnapshot?: Rel<AccountSnapshot>
  ) {
    this.node = node;
    this.changeset = changeset;
    this.name = name;
    this.balanceType = balanceType;
    this.accountClass = groupType;
    this.changeReason = changeReason;
    this.previousSnapshot = previousSnapshot;
  }

  // Método de Domínio: Quando o Changeset for aprovado, ele carimba a data efetiva aqui
  markAsPublished(effectiveDate: Date) {
    this.effectiveDate = effectiveDate;
  }
}