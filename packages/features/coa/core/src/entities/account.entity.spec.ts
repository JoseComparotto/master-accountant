import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccountEntity, AccountProps, CreateChildAccountProps, CreateRootAccountProps } from './account.entity.js';
import { AccountClassEnum } from '../enums/account-class.enum.js';
import { BalanceTypeEnum } from '../enums/balance-type.enum.js';
import { UuidValue } from '@repo/shared-core';
import { StructuralCodeValue } from '../value-objects/structural-code.value.js';

// Mock parcial das dependências externas compartilhadas
vi.mock('@repo/shared-core', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@repo/shared-core')>();
    return {
        ...actual, 
        Ensure: {
            vo: vi.fn((_, factory) => factory()),
            isInstanceOf: vi.fn(),
            isType: vi.fn(),
            isEnum: vi.fn(),
        },
        UuidValue: {
            create: vi.fn((val) => ({ value: val })),
            isEquals: vi.fn((a, b) => a.value === b.value),
        }
    };
});

vi.mock('../value-objects/account-name.value.js', () => ({
    AccountNameValue: {
        create: vi.fn((val) => ({ value: val }))
    }
}));

describe('AccountEntity', () => {
    // Stubs para simplificar a criação nos testes
    const mockUuid = (val: string) => ({ value: val } as UuidValue);
    const mockName = (val: string) => ({ value: val } as UuidValue);
    const mockStructuralCode = (code: string, index: number) => ({
        value: code,
        localIndex: index,
        compareTo: vi.fn((other) => code.localeCompare(other.value))
    } as unknown as StructuralCodeValue);

    describe('Fábricas de Criação (Factories)', () => {
        it('deve criar uma conta raiz com os valores padrão corretos', () => {
            const rootProps: CreateRootAccountProps = {
                id: 'uuid-root',
                name: 'Ativo',
                accountClass: AccountClassEnum.ASSET,
                structuralCode: mockStructuralCode('1', 1),
            };

            const account = AccountEntity.createRoot(rootProps);

            expect(account.id.value).toBe('uuid-root');
            expect(account.name.value).toBe('Ativo');
            expect(account.parentId).toBeNull();
            expect(account.isSummary).toBe(true); // Default do createRoot
            expect(account.isActive).toBe(true); // Default do createRoot
            expect(account.isContra).toBe(false); // Default do createRoot
            expect(account.description).toBeNull();
        });

        it('deve criar uma conta filha mapeando o parentId corretamente', () => {
            const childProps: CreateChildAccountProps = {
                id: 'uuid-child',
                name: 'Caixa Geral',
                parentId: 'uuid-root',
                isSummary: false,
                accountClass: AccountClassEnum.ASSET,
                structuralCode: mockStructuralCode('1.1', 1),
                isContra: false,
                isActive: true
            };

            const account = AccountEntity.createChild(childProps);

            expect(account.id.value).toBe('uuid-child');
            expect(account.parentId?.value).toBe('uuid-root');
            expect(account.isSummary).toBe(false);
        });

        it('deve reconstituir o estado completo de uma conta a partir de propriedades puras', () => {
            const data = {
                id: mockUuid('uuid-saved'),
                name: mockName('Bancos'),
                description: 'Conta movimento',
                parentId: mockUuid('uuid-root'),
                structuralCode: mockStructuralCode('1.2', 2),
                accountClass: AccountClassEnum.ASSET,
                isSummary: false,
                isContra: true,
                isActive: false
            };

            const account = AccountEntity.reconstitute(data);

            expect(account.id).toBe(data.id);
            expect(account.name.value).toBe('Bancos');
            expect(account.description).toBe('Conta movimento');
            expect(account.parentId?.value).toBe('uuid-root');
            expect(account.structuralCode?.value).toBe('1.2');
            expect(account.localIndex).toBe(2);
            expect(account.accountClass).toBe(AccountClassEnum.ASSET);
            expect(account.isSummary).toBe(false);
            expect(account.isContra).toBe(true);
            expect(account.isActive).toBe(false);
        });
    });

    describe('Regras de Negócio Contábeis (balanceType via XOR)', () => {
        // Regra: Ativo (ASSET) e Despesa (EXPENSE) são DEBIT por natureza (se isContra for false)
        it('deve retornar DEBIT para uma conta de Ativo normal', () => {
            const account = AccountEntity.reconstitute({
                accountClass: AccountClassEnum.ASSET,
                isContra: false
            } as AccountProps);

            expect(account.balanceType).toBe(BalanceTypeEnum.DEBIT);
        });

        it('deve inverter para CREDIT se a conta de Ativo for Redutora (isContra)', () => {
            const account = AccountEntity.reconstitute({
                accountClass: AccountClassEnum.ASSET,
                isContra: true
            } as AccountProps);

            expect(account.balanceType).toBe(BalanceTypeEnum.CREDIT);
        });

        // Regra: Passivo, Patrimônio Líquido e Receita são CREDIT por natureza (se isContra for false)
        it('deve retornar CREDIT para uma conta de Receita normal', () => {
            const account = AccountEntity.reconstitute({
                accountClass: AccountClassEnum.INCOME,
                isContra: false
            } as AccountProps);

            expect(account.balanceType).toBe(BalanceTypeEnum.CREDIT);
        });

        it('deve inverter para DEBIT se a conta de Receita for Redutora (isContra)', () => {
            const account = AccountEntity.reconstitute({
                accountClass: AccountClassEnum.INCOME,
                isContra: true
            } as AccountProps);

            expect(account.balanceType).toBe(BalanceTypeEnum.DEBIT);
        });
    });

    describe('Mutações de Estado', () => {
        let account: AccountEntity;

        beforeEach(() => {
            account = AccountEntity.createRoot({
                id: 'uuid',
                name: 'Conta Teste',
                description: 'Descrição Teste',
                isSummary: false,
                accountClass: AccountClassEnum.ASSET,
                structuralCode: mockStructuralCode('1', 1),
            } as CreateRootAccountProps);
        });

        it('deve permitir inativar e reativar a conta', () => {
            expect(account.isActive).toBe(true);

            account.inactivate();
            expect(account.isActive).toBe(false);

            account.activate();
            expect(account.isActive).toBe(true);
        });

        it('deve permitir converter para contra (redutora) e reverter para normal', () => {
            expect(account.isContra).toBe(false);

            account.convertToContra();
            expect(account.isContra).toBe(true);

            account.convertToNormal();
            expect(account.isContra).toBe(false);
        });

        it('deve atualizar metadados permitidos via patchMetadata', () => {
            account.patchMetadata({
                name: 'Novo Nome da Conta',
                description: 'Nova Descrição'
            });

            expect(account.name.value).toBe('Novo Nome da Conta');
            expect(account.description).toBe('Nova Descrição');
        });

        it('deve manter a descrição inalterada se omitida no patchMetadata', () => {
            account.patchMetadata({ name: 'Apenas alterando nome' });
            
            expect(account.name.value).toBe('Apenas alterando nome');
            expect(account.description).toBe('Descrição Teste');
        });
        
        it('deve manter o nome inalterado se omitido no patchMetadata', () => {
            account.patchMetadata({ description: 'Apenas alterando descrição' });
            
            expect(account.name.value).toBe('Conta Teste');
            expect(account.description).toBe('Apenas alterando descrição'); // Mantém o default original
        });
    });

    describe('Ordenação e Comparação', () => {
        it('deve comparar duas contas delegando a responsabilidade ao StructuralCodeValue', () => {
            const codeA = mockStructuralCode('1.1', 1);
            const codeB = mockStructuralCode('1.2', 2);

            const accountA = AccountEntity.reconstitute({ structuralCode: codeA } as AccountProps);
            const accountB = AccountEntity.reconstitute({ structuralCode: codeB } as AccountProps);

            accountA.compareTo(accountB);

            expect(codeA.compareTo).toHaveBeenCalledWith(codeB);
        });

        it('deve ordenar um array de contas corretamente através do método estático sortByCode', () => {
            const acc1 = AccountEntity.reconstitute({ structuralCode: mockStructuralCode('1.2', 2) } as AccountProps);
            const acc2 = AccountEntity.reconstitute({ structuralCode: mockStructuralCode('1.1', 1) } as AccountProps);
            const acc3 = AccountEntity.reconstitute({ structuralCode: mockStructuralCode('2', 1) } as AccountProps);

            const list = [acc1, acc2, acc3];
            list.sort((a,b)=> a.compareTo(b));

            // Verifica se a ordenação respeitou os códigos estruturais ('1.1', '1.2', '2')
            expect(list[0].structuralCode.value).toBe('1.1');
            expect(list[1].structuralCode.value).toBe('1.2');
            expect(list[2].structuralCode.value).toBe('2');
        });
    });
});