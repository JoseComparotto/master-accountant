import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Enum,
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
import type { AccountChangesetValidator } from '../services/account-changeset-validator.service';

/**
 * Entidade que representa um pacote de mudanças planejadas para o plano de contas, permitindo a criação de rascunhos, publicação e controle de versões.
 * 
 * O AccountChangeset é o núcleo do processo de gerenciamento de mudanças no plano de contas. Ele encapsula um conjunto de alterações (novas contas, inativações, transições) que um contador deseja aplicar ao plano. O fluxo típico é:
 * 1. O contador cria um novo AccountChangeset em status DRAFT, associando-o a um ChartOfAccounts específico e definindo o tipo de incremento de versão (MAJOR ou MINOR).
 * 2. O contador adiciona alterações ao pacote, como novas contas (AccountNode), inativações de contas existentes e transições de contas.
 * 3. Quando o contador estiver satisfeito com as mudanças, ele pode publicar o pacote. O método publish() valida as regras de negócio (como a obrigatoriedade da data-base e a existência de alterações) e, se tudo estiver correto, muda o status para PUBLISHED e registra a data de publicação.
 * 4. Se o contador decidir desistir das mudanças antes de publicar, ele pode chamar o método discard(), que marca o pacote como descartado e impede sua publicação futura.
 *
 */

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

  // O Tempo do Sistema: Quando o rascunho começou a ser criado e quando foi oficializado ou descartado
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
  publish(validator: AccountChangesetValidator, effectiveDate?: Date) {
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

    // Valida as regras de negócio antes de publicar
    validator.validate(this);

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