import { 
  Entity, 
  PrimaryKey, 
  ManyToOne, 
  Enum, 
  Property
} from '@mikro-orm/decorators/legacy';
import type { Rel } from '@mikro-orm/postgresql';
import { v4 } from 'uuid';

import { AccountChangeset } from './account-changeset.entity';
import { AccountNode } from './account-node.entity';
import { TransitionType } from '@modules/chart-of-accounts/domain/enumns/transition-type.enum';
import { ChangesetStatus } from '@modules/chart-of-accounts/domain/enumns/changeset-status.enum';

@Entity({schema: 'coa'})
export class AccountTransition {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => AccountChangeset)
  changeset!: Rel<AccountChangeset>;

  @Enum(() => ChangesetStatus)
  @Property({ persist: false })
  status!: ChangesetStatus;

  @Enum(() => TransitionType)
  transitionType!: TransitionType;

  // A Identidade Antiga
  @ManyToOne(() => AccountNode, { nullable: true })
  sourceNode?: Rel<AccountNode>; 

  // A Identidade Nova
  @ManyToOne(() => AccountNode, { nullable: true })
  targetNode?: Rel<AccountNode>; 

  @Property({ nullable: true })
  changeReason?: string; // Ex: "Desmembramento para melhor detalhamento" ou "Agrupamento para simplificar estrutura"

  // 3. O Eixo Bitemporal
  @Property()
  createdAt: Date = new Date(); // Tempo do Sistema: Quando este registro foi salvo no banco

  // Desnormalização para leitura super rápida de auditoria/balanço
  // Só recebe valor quando o Changeset for publicado (Status = 'published')
  @Property({ type: 'date', nullable: true })
  effectiveDate?: Date; 

  constructor(
    changeset: Rel<AccountChangeset>,
    transitionType: TransitionType,
    sourceNode?: Rel<AccountNode>,
    targetNode?: Rel<AccountNode>,
  ) {
    this.changeset = changeset;
    this.transitionType = transitionType;
    this.sourceNode = sourceNode;
    this.targetNode = targetNode;
  }

  
  // Método de Domínio: Quando o Changeset for aprovado, ele carimba a data efetiva aqui
  markAsPublished(effectiveDate: Date) {
    // this.status = ChangesetStatus.PUBLISHED;
    this.effectiveDate = effectiveDate;
  }

  markAsDiscarded() {
    this.status = ChangesetStatus.DRAFT;
    this.effectiveDate = undefined;
  }
}