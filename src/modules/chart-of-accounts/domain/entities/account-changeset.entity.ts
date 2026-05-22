import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Enum,
  Unique
} from '@mikro-orm/decorators/legacy';
import { Collection } from '@mikro-orm/postgresql';
import type { Rel } from '@mikro-orm/postgresql';
import { v4 } from 'uuid';

import { ChartOfAccounts } from './chart-of-accounts.entity';
import { AccountSnapshot } from './account-snapshot.entity';
import { AccountTransition } from './account-transition.entity';
import { ChangesetStatus } from '@modules/chart-of-accounts/domain/enums/changeset-status.enum';
import { VersionIncrementType } from '@modules/chart-of-accounts/domain/enums/version-increment-type.enum';
import { DomainError } from '@/shared/exceptions/domain.error';
import { AccountNode } from '@/modules/chart-of-accounts/domain/entities/account-node.entity';

@Entity({ schema: 'coa' })
export class AccountChangeset {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Enum(() => ChangesetStatus)
  status: ChangesetStatus = ChangesetStatus.DRAFT;

  @ManyToOne(() => ChartOfAccounts)
  chartOfAccounts!: Rel<ChartOfAccounts>;

  @Enum(() => VersionIncrementType)
  incrementType!: VersionIncrementType;

  // O Tempo do Negócio: A partir de que dia contábil essas mudanças valem?
  @Property({ columnType: 'date', nullable: true })
  effectiveDate?: Date;

  // O Tempo do Sistema: Quando o rascunho começou a ser criado e quando foi oficializado
  @Property()
  createdAt: Date = new Date();

  @Property({ columnType: 'date', nullable: true })
  publishedAt?: Date;

  @Property({ columnType: 'date', nullable: true })
  discardedAt?: Date;

  @OneToMany(() => AccountNode, node => node.creationChangeset)
  newNodes = new Collection<AccountNode>(this);

  @OneToMany(() => AccountNode, node => node.inactivationChangeset)
  inactivatedNodes = new Collection<AccountNode>(this);

  // Os pacotes englobados neste rascunho
  @OneToMany(() => AccountSnapshot, snapshot => snapshot.changeset)
  newSnapshots = new Collection<AccountSnapshot>(this);

  @OneToMany(() => AccountTransition, transition => transition.changeset)
  transitions = new Collection<AccountTransition>(this);

  private constructor(
    id: string,
    chartOfAccounts: Rel<ChartOfAccounts>,
    incrementType: VersionIncrementType,
    effectiveDate?: Date
  ) {
    this.id = id;
    this.chartOfAccounts = chartOfAccounts;
    this.incrementType = incrementType;
    this.effectiveDate = effectiveDate;
  }

  public static create(
    id: string | undefined,
    chartOfAccounts: Rel<ChartOfAccounts>,
    incrementType: VersionIncrementType,
    effectiveDate?: Date
  ): AccountChangeset {
    return new AccountChangeset(id ?? v4(), chartOfAccounts, incrementType, effectiveDate);
  }

  // Método de Domínio: Executado quando o contador clica em "Publicar Alterações"
  publish(effectiveDate?: Date) {
    if (this.status !== ChangesetStatus.DRAFT) {
      throw new Error('Apenas pacotes em rascunho podem ser publicados.');
    }

    // Se ele não escolheu a data na criação do rascunho, pode escolher na publicação
    if (effectiveDate) {
      this.effectiveDate = effectiveDate;
    }

    if (!this.effectiveDate) {
      throw new Error('Uma data-base (effectiveDate) é obrigatória para publicar.');
    }
    
    if(this.newSnapshots.count() === 0 && this.transitions.count() === 0 && this.newNodes.count() === 0) {
      throw new Error('Não é possível publicar um pacote sem alterações.');
    }

    this.status = ChangesetStatus.PUBLISHED;
    this.publishedAt = new Date();

    // Desnormalização: Propaga a data-base para leitura rápida nos relatórios
    for (const snapshot of this.newSnapshots) {
      snapshot.markAsPublished(this.effectiveDate);
    }
    for (const transition of this.transitions) {
      transition.markAsPublished(this.effectiveDate);
    }
  }

  // Método de Domínio: Desistiu de alterar o plano
  discard() {
    if (this.status !== ChangesetStatus.DRAFT) {
      throw new DomainError('Apenas pacotes em rascunho podem ser descartados.');
    }

    for (const snapshot of this.newSnapshots) {
      snapshot.markAsDiscarded();
    }
    for (const transition of this.transitions) {
      transition.markAsDiscarded();
    }

    this.status = ChangesetStatus.DISCARDED;
    this.discardedAt = new Date();
  }
}