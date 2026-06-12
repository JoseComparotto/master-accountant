import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChartOfAccountsEntity, CreateChildAccountInput, CreateRootAccountInput } from './chart-of-accounts.entity.js';
import { AccountCollection } from '../collections/account.collection.js';
import { AccountEntity } from './account.entity.js';
import { VersionValue } from '../value-objects/version.value.js';
import { UuidValue } from '../../../shared/index.js';
import { StructuralCodeValue } from '../value-objects/structural-code.value.js';
import { 
    AccountInvariantViolationException, 
    DuplicatedAccountCodeException 
} from '../exceptions/account.exception.js';
import { AccountClassEnum } from '../enums/account-class.enum.js';

// Mocks das dependências
vi.mock('../collections/account.collection.js');
vi.mock('./account.entity.js');
vi.mock('../value-objects/structural-code.value.js');
vi.mock('../value-objects/version.value.js');

describe('ChartOfAccountsEntity Unit Tests', () => {
    let mockId: any;
    let mockVersion: any;
    let mockCollection: any;
    let chartOfAccounts: ChartOfAccountsEntity;

    beforeEach(() => {
        vi.clearAllMocks();

        // Inicialização de instâncias falsas (stubs) para os testes
        mockCollection = {
            getByParentId: vi.fn().mockReturnValue([]),
            getAll: vi.fn().mockReturnValue([]),
            getById: vi.fn(),
            getByCode: vi.fn(),
            add: vi.fn()
        };

        mockId = {} as UuidValue;
        mockVersion = {} as VersionValue;
        
        // Como o construtor é privado, usamos o reconstitute com uma coleção mockada
        vi.spyOn(AccountCollection, 'fromAccounts').mockReturnValue(mockCollection);
        chartOfAccounts = ChartOfAccountsEntity.reconstitute(mockId,[], mockVersion);
    });

    describe('Criação de Contas Raiz (createRootAccount)', () => {
        it('deve criar uma conta raiz com sucesso se não existir outra da mesma classe', () => {
            const input: CreateRootAccountInput = {
                id: 'root-id',
                localIndex: 1,
                name: 'Ativo',
                description: 'Contas de Ativo',
                accountClass: AccountClassEnum.ASSET,
                isSummary: true,
                isContra: false,
                isActive: true
            };

            const mockCreatedAccount = { id: input.id } as unknown as AccountEntity;
            vi.spyOn(AccountEntity, 'createRoot').mockReturnValue(mockCreatedAccount);
            vi.spyOn(StructuralCodeValue, 'createRoot').mockReturnValue({ value: '1' } as StructuralCodeValue);

            // Mock de raízes vazias inicialmente
            mockCollection.getByParentId.mockReturnValue([]); 

            const result = chartOfAccounts.createRootAccount(input);

            expect(mockCollection.add).toHaveBeenCalledWith(mockCreatedAccount);
            expect(result).toBe(mockCreatedAccount);
        });

        it('deve lançar AccountInvariantViolationException (HTI-01) ao duplicar classe na raiz', () => {
            const input: CreateRootAccountInput = {
                id: 'root-id-2',
                localIndex: 2,
                name: 'Ativo Novo',
                accountClass: AccountClassEnum.ASSET, // Mesma classe
                isSummary: true,
                isContra: false,
                isActive: true
            };

            // Simula que já existe uma conta raiz com a classe ASSET
            const existingRoot = { accountClass: AccountClassEnum.ASSET } as AccountEntity;
            mockCollection.getByParentId.mockReturnValue([existingRoot]);

            expect(() => {
                chartOfAccounts.createRootAccount(input);
            }).toThrow(AccountInvariantViolationException);
            
            // Verifica se a mensagem ou código bate com a invariante
            expect(() => chartOfAccounts.createRootAccount(input)).toThrow(/HTI-01/);
        });
    });

    describe('Criação de Contas Filhas (createChildAccount)', () => {
        let parentMock: any;

        beforeEach(() => {
            parentMock = {
                id: { value: 'parent-id' } as UuidValue,
                accountClass: AccountClassEnum.ASSET,
                isSummary: true,
                isActive: true,
                isContra: false,
                structuralCode: { createChild: vi.fn() } as unknown as StructuralCodeValue
            } as AccountEntity;
            mockCollection.getById.mockReturnValue(parentMock);
        });

        it('deve criar uma conta filha herdando propriedades implícitas do pai', () => {
            const input: CreateChildAccountInput = {
                id: 'child-id',
                parentId: 'parent-id',
                name: 'Caixa Geral',
                isSummary: false
            };

            vi.spyOn(AccountEntity, 'createChild').mockReturnValue({ id: input.id } as any);

            chartOfAccounts.createChildAccount(input);

            expect(AccountEntity.createChild).toHaveBeenCalledWith(expect.objectContaining({
                accountClass: parentMock.accountClass, // Herdado
                isContra: parentMock.isContra,         // Herdado
                isActive: parentMock.isActive          // Herdado
            }));
            expect(mockCollection.add).toHaveBeenCalled();
        });

        it('deve lançar exceção (HTI-04) se o pai não for uma conta sintética/resumo (isSummary = false)', () => {
            parentMock.isSummary = false; // Conta analítica não pode ter filhas

            const input:CreateChildAccountInput = {
                id: 'child-id',
                parentId: 'parent-id',
                name: 'Sub-conta inválida',
                isSummary: false
            };

            expect(() => chartOfAccounts.createChildAccount(input)).toThrow(/HTI-04/);
        });

        it('deve lançar exceção (HTI-07) se o pai estiver inativo e a filha tentar ser ativa', () => {
            parentMock.isActive = false; // Pai Inativo

            const input: CreateChildAccountInput = {
                id: 'child-id',
                parentId: 'parent-id',
                name: 'Filha Ativa',
                isSummary: false,
                isActive: true // Forçando ativação
            };

            expect(() => chartOfAccounts.createChildAccount(input)).toThrow(/HTI-07/);
        });

        it('deve lançar exceção (COA-01) se a classe da conta filha divergir da classe do pai', () => {
            const input: CreateChildAccountInput = {
                id: 'child-id',
                parentId: 'parent-id',
                name: 'Filha com classe errada',
                isSummary: false,
                accountClass: AccountClassEnum.LIABILITY // Divergente de ASSET
            };

            expect(() => chartOfAccounts.createChildAccount(input)).toThrow(/COA-01/);
        });

        it('deve lançar DuplicatedAccountCodeException se o localIndex fornecido já estiver em uso por um irmão', () => {
            const input: CreateChildAccountInput = {
                id: 'child-id',
                parentId: 'parent-id',
                name: 'Filha Duplicada',
                isSummary: false,
                localIndex: 3 // Forçando index 3
            };

            const siblingMock = { localIndex: 3, structuralCode: '1.1.3' } as any;
            mockCollection.getByParentId.mockReturnValue([siblingMock]); // Irmão já usa o 3

            expect(() => chartOfAccounts.createChildAccount(input)).toThrow(DuplicatedAccountCodeException);
        });

        it('deve calcular automaticamente o próximo localIndex incremental quando este não for fornecido', () => {
            const input: CreateChildAccountInput = {
                id: 'child-id',
                parentId: 'parent-id',
                name: 'Filha Auto-Index',
                isSummary: false
                // localIndex omitido
            };

            const sibling1 = { localIndex: 1 } as AccountEntity;
            const sibling2 = { localIndex: 4 } as AccountEntity;
            mockCollection.getByParentId.mockReturnValue([sibling1, sibling2]); // O maior index é 4

            chartOfAccounts.createChildAccount(input);

            // Deve calcular o próximo index como 4 + 1 = 5
            expect(parentMock.structuralCode.createChild).toHaveBeenCalledWith(5);
        });
    });

    describe('Ciclo de Vida de Ativação e Inativação', () => {
        it('deve permitir inativar uma conta se ela não possuir filhos ativos', () => {
            const accountMock = { id: { value: 'acc-id' }, isActive: true, inactivate: vi.fn() } as any;
            mockCollection.getById.mockReturnValue(accountMock);
            
            // Simula filhos, mas todos já estão inativos
            const inactiveChild = { isActive: false } as AccountEntity;
            mockCollection.getByParentId.mockReturnValue([inactiveChild]);

            chartOfAccounts.inactivateAccount({ value: 'acc-id' } as UuidValue);

            expect(accountMock.inactivate).toHaveBeenCalled();
        });

        it('deve lançar exceção (HTI-07) ao tentar inativar uma conta com filhos ainda ativos', () => {
            const accountMock = { id: { value: 'acc-id' }, isActive: true, inactivate: vi.fn() } as any;
            mockCollection.getById.mockReturnValue(accountMock);
            
            const activeChild = { isActive: true } as AccountEntity;
            mockCollection.getByParentId.mockReturnValue([activeChild]); // Filho ativo detetado

            expect(() => {
                chartOfAccounts.inactivateAccount({ value: 'acc-id' } as UuidValue);
            }).toThrow(/HTI-07/);
            expect(accountMock.inactivate).not.toHaveBeenCalled();
        });

        it('deve lançar exceção (HTI-07) ao tentar ativar uma conta cujo pai está inativo', () => {
            const accountMock = { 
                id: { value: 'acc-id' }, 
                parentId: { value: 'parent-id' }, 
                isActive: false, 
                activate: vi.fn() 
            } as any;
            const inactiveParentMock = { isActive: false } as AccountEntity;

            // Retorna o nó atual no primeiro call e o pai inativo no segundo call
            mockCollection.getById
                .mockReturnValueOnce(accountMock)
                .mockReturnValueOnce(inactiveParentMock);

            expect(() => {
                chartOfAccounts.activateAccount({ value: 'acc-id' } as UuidValue);
            }).toThrow(/HTI-07/);
            expect(accountMock.activate).not.toHaveBeenCalled();
        });
    });

    describe('Conversão de Comportamento (Normal vs Contra-Conta)', () => {
        it('deve lançar exceção (COA-02) ao tentar converter para Normal se o pai for uma Contra-Conta', () => {
            const accountMock = { 
                id: { value: 'acc-id' }, 
                parentId: { value: 'parent-id' }, 
                isContra: true, 
                convertToNormal: vi.fn() 
            } as any;
            const contraParentMock = { isContra: true } as AccountEntity; // Pai é contra-conta

            mockCollection.getById
                .mockReturnValueOnce(accountMock)
                .mockReturnValueOnce(contraParentMock);

            expect(() => {
                chartOfAccounts.convertToNormalAccount({ value: 'acc-id' } as UuidValue);
            }).toThrow(/COA-02/);
            expect(accountMock.convertToNormal).not.toHaveBeenCalled();
        });

        it('deve lançar exceção (COA-02) ao tentar converter para Contra se possuir filhos normais', () => {
            const accountMock = { id: { value: 'acc-id' }, isContra: false, convertToContra: vi.fn() } as any;
            mockCollection.getById.mockReturnValue(accountMock);

            const normalChild = { isContra: false } as AccountEntity; // Filho normal (não-contra)
            mockCollection.getByParentId.mockReturnValue([normalChild]);

            expect(() => {
                chartOfAccounts.convertToContraAccount({ value: 'acc-id' } as UuidValue);
            }).toThrow(/COA-02/);
            expect(accountMock.convertToContra).not.toHaveBeenCalled();
        });
    });
});