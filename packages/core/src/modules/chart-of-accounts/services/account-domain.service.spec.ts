import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { AccountDomainService } from './account-domain.service.js';
import { AccountEntity, CreateAccountProps } from '../entities/account.entity.js';
import { AccountInvariantViolationException } from '../exceptions/account.exception.js';
import type { IHierarchyCheckerService } from '../interfaces/hierarchy-checker.interface.js';
import { AccountClassEnum } from '../enums/account-class.enum.js';
import { IAccountRepository } from '../interfaces/account-repository.interface.js';
import { AttributeImmutableViolationException } from '../../../shared/exception/domain.exception.js';
import { AccountNameValue } from '../value-objects/account-name.value.js';
import { UuidValue } from '../../../shared/value-objects/uuid.value.js';

describe('AccountDomainService', () => {
    let service: AccountDomainService;

    // Declaração de dublês de teste (Mocks)
    let hierarchyCheckerMock: Record<string, any>;
    let repositoryMock: Record<string, any>;

    beforeEach(() => {
        hierarchyCheckerMock = {};
        repositoryMock = {
            findLastLocalIndex: vi.fn(),
        };

        service = new AccountDomainService(
            hierarchyCheckerMock as unknown as IHierarchyCheckerService,
            repositoryMock as unknown as IAccountRepository
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('createAccount - Orquestração e Instanciação de Contas', () => {

        test('deve lançar AccountInvariantViolationException (COA-01) se tentar criar uma conta sem pai e sem classe definida', async () => {
            const payloadInvalido: CreateAccountProps = {
                localIndex: 1,
                parent: null,
                accountClass: undefined,
                name: 'Conta Fantasma' as any,
                isSummary: true,
                isContra: false,
                isActive: true
            };

            await expect(service.createAccount(payloadInvalido)).rejects.toThrow(
                AccountInvariantViolationException
            );

            try {
                await service.createAccount(payloadInvalido);
            } catch (error: any) {
                expect(error.ruleId).toBe('COA-01');
                expect(error.message).toContain('Root accounts must have an account class defined.');
            }
        });

        test('deve criar uma conta Raiz calculando dinamicamente o localIndex se ele for omitido', async () => {
            // Configura o mock do repositório para simular que a última raiz tinha o índice 4
            repositoryMock.findLastLocalIndex.mockResolvedValue(4);

            // Instancia um mock simulado do que a Factory da Entidade retornaria
            const mockAccountInstance = { id: 'root-id-123' } as unknown as AccountEntity;
            const createRootSpy = vi.spyOn(AccountEntity, 'createRoot').mockResolvedValue(mockAccountInstance);

            const payload = {
                parent: null,
                accountClass: AccountClassEnum.ASSET,
                name: 'ATIVO' as any,
                isSummary: true,
                isContra: false,
                isActive: true
            };

            const result = await service.createAccount(payload);

            // Assertions de Orquestração
            expect(repositoryMock.findLastLocalIndex).toHaveBeenCalledWith(null);
            expect(createRootSpy).toHaveBeenCalledWith(
                {
                    name: 'ATIVO' as any,
                    accountClass: AccountClassEnum.ASSET,
                    isSummary: true,
                    isContra: false,
                    isActive: true,
                    localIndex: 5 // 4 (do banco) + 1 (regra sequencial)
                },
                hierarchyCheckerMock
            );
            expect(result).toBe(mockAccountInstance);
        });

        test('deve criar uma conta Raiz respeitando o localIndex se ele for explicitamente enviado no payload', async () => {
            const mockAccountInstance = {} as AccountEntity;
            const createRootSpy = vi.spyOn(AccountEntity, 'createRoot').mockResolvedValue(mockAccountInstance);

            const payload: CreateAccountProps = {
                parent: null,
                accountClass: AccountClassEnum.LIABILITY,
                localIndex: 99, // Índice forçado (ex: migração ou ordenação manual)
                name: 'PASSIVO' as any,
                isSummary: true,
                isContra: false,
                isActive: true
            };

            await service.createAccount(payload);

            // Curto-circuito: Se o índice foi enviado, o banco NÃO deve ser consultado
            expect(repositoryMock.findLastLocalIndex).not.toHaveBeenCalled();
            expect(createRootSpy).toHaveBeenCalledWith(
                expect.objectContaining({ localIndex: 99 }),
                hierarchyCheckerMock
            );
        });

        test('deve criar uma conta Filho calculando dinamicamente o localIndex baseado no ID do pai', async () => {
            const mockParent = { id: 'parent-uuid-555' } as unknown as AccountEntity;
            repositoryMock.findLastLocalIndex.mockResolvedValue(0); // Primeira conta filha desse pai

            const mockChildInstance = { id: 'child-uuid' } as unknown as AccountEntity;
            const createChildSpy = vi.spyOn(AccountEntity, 'createChild').mockResolvedValue(mockChildInstance);

            const payload = {
                parent: mockParent,
                name: 'Banco Conta Movimento' as any,
                isSummary: false,
                isContra: false,
                isActive: true
            };

            const result = await service.createAccount(payload);

            expect(repositoryMock.findLastLocalIndex).toHaveBeenCalledWith('parent-uuid-555');
            expect(createChildSpy).toHaveBeenCalledWith(
                {
                    parent: mockParent,
                    name: 'Banco Conta Movimento',
                    isSummary: false,
                    isContra: false,
                    isActive: true,
                    localIndex: 1, // 0 + 1
                    accountClass: undefined
                },
                hierarchyCheckerMock
            );
            expect(result).toBe(mockChildInstance);
        });
    });

    describe('Delegação de Comportamentos e Mutações', () => {

        test('patchAccountMetadata - deve delegar a alteração de metadados diretamente para a instância da entidade', () => {
            const mockAccount = {
                patchMetadata: vi.fn()
            } as unknown as AccountEntity;

            const patchPayload = { name: 'Novo Nome Alterado' as any, description: 'Nova Descrição' };

            service.patchAccountMetadata(mockAccount, patchPayload);

            expect(mockAccount.patchMetadata).toHaveBeenCalledWith(patchPayload);
            expect(mockAccount.patchMetadata).toHaveBeenCalledTimes(1);
        });

        test('activateAccount - deve delegar o comando de ativação para a instância da entidade', () => {
            const mockAccount = {
                activate: vi.fn()
            } as unknown as AccountEntity;

            service.activateAccount(mockAccount);

            expect(mockAccount.activate).toHaveBeenCalledTimes(1);
        });

        test('inactivateAccount - deve invocar a inativação da entidade passando o consultor de hierarquia', async () => {
            const mockAccount = {
                inactivate: vi.fn().mockResolvedValue(undefined)
            } as unknown as AccountEntity;

            await service.inactivateAccount(mockAccount);

            // Garante que o serviço injetou a barreira de validação hierárquica na entidade
            expect(mockAccount.inactivate).toHaveBeenCalledWith(hierarchyCheckerMock);
            expect(mockAccount.inactivate).toHaveBeenCalledTimes(1);
        });

        test('applyContraLogic - deve delegar a aplicação da lógica de contra-conta diretamente para a instância da entidade', async () => {
            const mockAccount = {
                applyContraLogic: vi.fn().mockResolvedValue(undefined)
            } as unknown as AccountEntity;

            const isContraTarget = true;

            await service.applyContraLogic(mockAccount, isContraTarget);

            expect(mockAccount.applyContraLogic).toHaveBeenCalledWith(isContraTarget, hierarchyCheckerMock);
            expect(mockAccount.applyContraLogic).toHaveBeenCalledTimes(1);
        });
    });

    describe('updateAccount - Atualização e Validação de Mutabilidade', () => {
        let mockAccount: any;

        beforeEach(() => {
            // Configura uma instância mockada da entidade com valores padrão
            mockAccount = {
                parentId: 'parent-123',
                name: 'Nome Antigo',
                description: 'Descrição Antiga',
                localIndex: 1,
                accountClass: AccountClassEnum.ASSET,
                isSummary: false,
                isContra: false,
                isActive: true,
                patchMetadata: vi.fn(),
                activate: vi.fn(),
                inactivate: vi.fn().mockResolvedValue(undefined),
                applyContraLogic: vi.fn().mockResolvedValue(undefined)
            };

            // Como o método usa métodos estáticos de Value Objects, criamos spies para controlar o comportamento do diffMap
            vi.spyOn(UuidValue, 'isEquals').mockImplementation((a, b) => a === b);
            vi.spyOn(AccountNameValue, 'isEquals').mockImplementation((a, b) => a === b);
        });

        test('deve lançar AttributeImmutableViolationException se tentar alterar um campo imutável (ex: localIndex)', async () => {
            const targetPayload = {
                parentId: 'parent-123',
                name: 'Nome Antigo',
                description: 'Descrição Antiga',
                localIndex: 99, // Alterado ilegalmente
                accountClass: AccountClassEnum.ASSET,
                isSummary: false,
                isContra: false,
                isActive: true
            };

            await expect(service.updateAccount(mockAccount, targetPayload)).rejects.toThrow(
                AttributeImmutableViolationException
            );
        });

        test('deve alterar o nome e a descrição com sucesso quando forem os únicos modificados', async () => {
            const targetPayload = {
                parentId: 'parent-123',
                name: 'Novo Nome Alterado', // Alterado
                description: 'Nova Descrição Alterada', // Alterado
                localIndex: 1,
                accountClass: AccountClassEnum.ASSET,
                isSummary: false,
                isContra: false,
                isActive: true
            };

            await service.updateAccount(mockAccount, targetPayload);

            // Garante que delegou a alteração de metadados para a entidade
            expect(mockAccount.patchMetadata).toHaveBeenCalledWith({
                name: 'Novo Nome Alterado',
                description: 'Nova Descrição Alterada'
            });
            
            // Garante que não disparou outros efeitos colaterais
            expect(mockAccount.applyContraLogic).not.toHaveBeenCalled();
            expect(mockAccount.activate).not.toHaveBeenCalled();
            expect(mockAccount.inactivate).not.toHaveBeenCalled();
        });

        test('deve aplicar a lógica de contra-conta se o campo isContra sofrer alteração', async () => {
            const targetPayload = {
                parentId: 'parent-123',
                name: 'Nome Antigo',
                description: 'Descrição Antiga',
                localIndex: 1,
                accountClass: AccountClassEnum.ASSET,
                isSummary: false,
                isContra: true, // Alterado de false para true
                isActive: true
            };

            await service.updateAccount(mockAccount, targetPayload);

            expect(mockAccount.applyContraLogic).toHaveBeenCalledWith(true, hierarchyCheckerMock);
        });

        test('deve ativar a conta se o campo isActive mudar para true', async () => {
            mockAccount.isActive = false; // Estado inicial na entidade é inativo

            const targetPayload = {
                parentId: 'parent-123',
                name: 'Nome Antigo',
                description: 'Descrição Antiga',
                localIndex: 1,
                accountClass: AccountClassEnum.ASSET,
                isSummary: false,
                isContra: false,
                isActive: true // Alterado para ativo
            };

            await service.updateAccount(mockAccount, targetPayload);

            expect(mockAccount.activate).toHaveBeenCalledTimes(1);
            expect(mockAccount.inactivate).not.toHaveBeenCalled();
        });

        test('deve inativar a conta injetando o hierarchyChecker se o campo isActive mudar para false', async () => {
            mockAccount.isActive = true; // Estado inicial na entidade é ativo

            const targetPayload = {
                parentId: 'parent-123',
                name: 'Nome Antigo',
                description: 'Descrição Antiga',
                localIndex: 1,
                accountClass: AccountClassEnum.ASSET,
                isSummary: false,
                isContra: false,
                isActive: false // Alterado para inativo
            };

            await service.updateAccount(mockAccount, targetPayload);

            expect(mockAccount.inactivate).toHaveBeenCalledWith(hierarchyCheckerMock);
            expect(mockAccount.activate).not.toHaveBeenCalled();
        });
    });
});