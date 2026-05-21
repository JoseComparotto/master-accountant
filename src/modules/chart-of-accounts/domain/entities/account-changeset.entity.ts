import { 
  Entity, 
  PrimaryKey, 
  Property, 
  ManyToOne, 
  OneToMany, 
  Enum 
} from '@mikro-orm/decorators/legacy';
import { Collection } from '@mikro-orm/core';
import type { Rel } from '@mikro-orm/core';
import { v4 } from 'uuid';

import { ChartOfAccounts } from './chart-of-accounts.entity';
import { AccountSnapshot } from './account-snapshot.entity';
import { AccountTransition } from './account-transition.entity';
import { ChangesetStatus } from '@modules/chart-of-accounts/domain/enumns/changeset-status.enum';
import { VersionIncrementType } from '@modules/chart-of-accounts/domain/enumns/version-increment-type.enum';

@Entity({schema: 'coa'})
export class AccountChangeset {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => ChartOfAccounts)
  chartOfAccounts!: Rel<ChartOfAccounts>;

  @Enum(() => VersionIncrementType)
  incrementType!: VersionIncrementType;

  @Enum(() => ChangesetStatus)
  status: ChangesetStatus = ChangesetStatus.DRAFT;

  // O Tempo do Negócio: A partir de que dia contábil essas mudanças valem?
  @Property({ type: 'date', nullable: true })
  effectiveDate?: Date; 

  // O Tempo do Sistema: Quando o rascunho começou a ser criado e quando foi oficializado
  @Property()
  createdAt: Date = new Date();

  @Property({ nullable: true })
  publishedAt?: Date;

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

    this.status = ChangesetStatus.PUBLISHED;
    this.publishedAt = new Date();
    
    // Se ele não escolheu a data na criação do rascunho, pode escolher na publicação
    if (effectiveDate) {
      this.effectiveDate = effectiveDate;
    }

    if (!this.effectiveDate) {
      throw new Error('Uma data-base (effectiveDate) é obrigatória para publicar.');
    }

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
      throw new Error('Não é possível descartar um pacote que já foi publicado.');
    }
    this.status = ChangesetStatus.DISCARDED;
  }
}