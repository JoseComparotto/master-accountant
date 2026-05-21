import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany
} from '@mikro-orm/decorators/legacy';
import { Collection } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { AccountNode } from './account-node.entity';
import { DomainError } from '@shared/exceptions/domain.error';

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

  @Property()
  createdAt: Date = new Date();

  // O construtor é privado. Ninguém pode usar `new ChartOfAccounts()` livremente.
  private constructor(id: string, name: string, levelWidths: number[]) {
    this.id = id;
    this.name = name;
    this.levelWidths = levelWidths;
  }

  // Factory Method: O único ponto de entrada para criar um novo Plano de Contas
  public static create(id: string | undefined, name: string, levelWidths: number[]): ChartOfAccounts {
    // 1. Invariante de Negócio: Não faz sentido plano sem nome
    if (!name || name.trim().length === 0) {
      throw new DomainError('O nome do Plano de Contas não pode estar vazio.');
    }

    // 2. Invariante de Negócio: Estrutura da máscara
    if (!levelWidths || levelWidths.length === 0) {
      throw new DomainError('O Plano de Contas precisa definir a largura de pelo menos um nível.');
    }

    // 3. Regra de Limite do LTree (Regra cruzada importante)
    // O PostgreSQL LTree tem um limite de 255 bytes/caracteres no caminho completo.
    // Somamos as larguras + a quantidade de pontos (separadores)
    const totalLength = levelWidths.reduce((sum, width) => sum + width, 0) + (levelWidths.length - 1);
    
    if (totalLength > 255) {
      throw new DomainError(
        `A máscara do plano de contas excede o limite máximo permitido para estruturação hierárquica. Máximo: 255 caracteres, Calculado: ${totalLength}.`
      );
    }

    // 4. Integridade matemática dos níveis
    for (const [index, width] of levelWidths.entries()) {
      if (width <= 0) {
        throw new DomainError(`A largura do nível ${index + 1} deve ser maior que zero.`);
      }
    }

    return new ChartOfAccounts(id ?? v4(), name, levelWidths);
  }

  // O getter apenas devolve a máscara visual usando o ponto fixo.
  get stringMask(): string {
    return this.levelWidths.map(w => '9'.repeat(w)).join('.');
  }
}