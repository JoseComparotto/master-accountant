import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToOne,
  OneToMany,
  Index,
  Unique
} from '@mikro-orm/decorators/legacy';
import { Collection } from '@mikro-orm/postgresql';
import type { Rel } from '@mikro-orm/postgresql';
import { v4 } from 'uuid';
import { ChartOfAccounts } from './chart-of-accounts.entity';
import { AccountSnapshot } from './account-snapshot.entity';
import { AccountChangeset } from '@/modules/chart-of-accounts/domain/entities/account-changeset.entity';

@Entity({ schema: 'coa' })
@Unique({ properties: ['chartOfAccounts', 'formattedCode'] })
@Index({ name: 'idx_account_node_path_ltree', properties: ['pathLtree'], type: 'gin' })
export class AccountNode {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => ChartOfAccounts)
  chartOfAccounts!: Rel<ChartOfAccounts>;

  @ManyToOne(() => AccountNode, { nullable: true })
  parent?: Rel<AccountNode>;

  @Property()
  isAbstract!: boolean; // ture se for conta analítica, false se sintética
  // A conta sintética é aquela que não tem lançamentos diretos, mas serve para agrupar contas analíticas. Ex: "1.1 - Ativo Circulante" é sintética, enquanto "1.1.01 - Caixa" é analítica.

  // A Fonte da Verdade: Inteiro puro
  @Property({ columnType: 'integer' })
  nodeCode!: number; // Ex: 1 (O código local deste nó)

  @Property({ columnType: 'ltree' })
  pathLtree!: string; // Ex: '1.1.01' - Gerado na criação e atualizado na alteração da mascara do plano de contas. Usado para consultas hierárquicas eficientes.

  @Property()
  formattedCode!: string; // Ex: '1.1.01' - Gerado na criação e atualizado na alteração da mascara do plano de contas

  // Ponteiro para a versão oficial (SSoT)
  @OneToOne(() => AccountSnapshot, { nullable: true })
  currentSnapshot?: Rel<AccountSnapshot>;

  @OneToMany(() => AccountSnapshot, snapshot => snapshot.node)
  history = new Collection<AccountSnapshot>(this);

  @ManyToOne(() => AccountChangeset)
  creationChangeset!: Rel<AccountChangeset>; // O pacote que criou este nó, para fins de reserva de código e rastreabilidade

  @ManyToOne(() => AccountChangeset, { nullable: true })
  inactivationChangeset?: Rel<AccountChangeset>; // O pacote que inativou este nó, para fins de rastreabilidade

  constructor(chart: ChartOfAccounts, parent: AccountNode | undefined, code: string) {
    this.chartOfAccounts = chart;
    this.parent = parent;
    this.nodeCode = parseInt(code, 10);
    // O pathLtree é gerado no hook de criação ou no service
  }

  // Método de domínio para trocar o snapshot
  updateVersion(newSnapshot: AccountSnapshot) {
    this.currentSnapshot = newSnapshot;
  }

  findSnapshotAt(date?: Date): AccountSnapshot | undefined {
    if (!date) return this.currentSnapshot;

    return this.history.getItems()
      .filter(s => s.effectiveDate && s.effectiveDate <= date)
      .sort((a, b) => b.effectiveDate!.getTime() - a.effectiveDate!.getTime())[0];
  }
}