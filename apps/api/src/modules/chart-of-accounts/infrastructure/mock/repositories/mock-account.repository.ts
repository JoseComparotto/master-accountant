import { Injectable } from "@nestjs/common";
import { AccountEntity, AccountClassEnum, AccountRepository, StructuralCodeValue } from "@repo/core";

// TODO: Substituir mock por ORM

@Injectable()
export class MockAccountRepository extends AccountRepository {

    private accounts: AccountEntity[] = [];
    constructor() {
        super();
        const commonProps = { isSummary: true, isContra: false, isActive: true };

        // 1. Definição declarativa e hierárquica usando códigos estruturais
        const definitions = [
            { code: '1', name: 'ATIVO', class: AccountClassEnum.ASSET },
            { code: '1.1', name: 'Ativo Circulante' },
            { code: '1.2', name: 'Ativo Não Circulante' },

            { code: '2', name: 'PASSIVO', class: AccountClassEnum.LIABILITY },
            { code: '2.1', name: 'Passivo Circulante' },
            { code: '2.2', name: 'Passivo Não Circulante' },

            { code: '3', name: 'PATRIMÔNIO LÍQUIDO', class: AccountClassEnum.EQUITY },

            { code: '4', name: 'RECEITAS', class: AccountClassEnum.INCOME },

            { code: '5', name: 'DESPESAS', class: AccountClassEnum.EXPENSE },
        ];

        // Mapa auxiliar para guardar as instâncias criadas e resolver o relacionamento 'parent'
        const accountsMap = new Map<string, AccountEntity>();

        this.accounts = definitions.map((def, index) => {
            // Mantém a geração de IDs 100% determinística e única baseado na sequência global
            const sequence = index + 1;
            const mockId = `00000000-0000-4000-8000-${sequence.toString().padStart(12, '0')}`;

            // Decompõe o código estrutural (ex: '1.1' -> ['1', '1'])
            const segments = def.code.split('.');

            // O localIndex é sempre o último número do código estrutural
            const localIndex = parseInt(segments[segments.length - 1]!, 10);

            // Identifica o código do pai removendo o último segmento (ex: '1.1' -> '1')
            const parentCode = segments.slice(0, -1).join('.');
            const parentEntity = parentCode ? accountsMap.get(parentCode) || null : null;

            // Se a conta não tiver classe explícita, ela herda do pai (DRY)
            const accountClass = def.class ?? (parentEntity ? parentEntity.accountClass : null);

            if (!accountClass) {
                throw new Error(`Não foi possível determinar a AccountClass para a conta contábil: ${def.code}`);
            }

            // Instancia o Value Object de código estrutural adequadamente para raízes ou filhos
            const structuralCode = segments.length === 1
                ? StructuralCodeValue.createRoot(localIndex)
                : StructuralCodeValue.fromString(def.code); // Mude para .create(def.code) ou o método de parsing do seu projeto

            const account = AccountEntity.reconstitute({
                ...commonProps,
                id: mockId,
                name: def.name,
                parent: parentEntity, // Agora vincula corretamente a entidade pai em memória
                description: null,
                accountClass,
                localIndex,
                structuralCode,
            });

            // Alimenta o mapa para que esta conta possa servir de pai para os próximos loops
            accountsMap.set(def.code, account);

            return account;
        });
    }

    async findAll(): Promise<AccountEntity[]> {
        return this.accounts;
    }

    async findById(id: string): Promise<AccountEntity | null> {
        return this.accounts.find(account => account.id === id) || null;
    }

    async findByParent(account: AccountEntity): Promise<AccountEntity[]> {
        return this.accounts.filter(acc => acc.parent?.id === account.id);
    }

    async findLastLocalIndex(parentId: string | null): Promise<number> {
        const siblings = parentId
            ? this.accounts.filter(acc => (acc.parent?.id ?? null) === parentId)
            : this.accounts.filter(acc => !acc.parent);
        return siblings.reduce((max, acc) => acc.localIndex > max ? acc.localIndex : max, 0);
    }

    async findRootByClass(accountClass: AccountClassEnum): Promise<AccountEntity | null> {
        return this.accounts.find(acc => acc.accountClass === accountClass && !acc.parent) || null;
    }

    async findByParentAndIndex(parent: AccountEntity | null, localIndex: number): Promise<AccountEntity | null> {
        const parentId = parent?.id ?? null;
        return this.accounts.find(acc => acc.parent?.id === parentId && acc.localIndex === localIndex) ?? null;
    }

    async save(account: AccountEntity): Promise<void> {
        const index = this.accounts.findIndex(acc => acc.id === account.id);
        if (index !== -1) {
            this.accounts[index] = account;
        } else {
            this.accounts.push(account);
        }
    }
}