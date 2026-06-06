import { describe, test, expect, vi, beforeEach } from 'vitest';
import { DefaultHierarchyCheckerService } from './default-hierarchy-checker.service.js';
import { AccountRepository } from '../interfaces/account-repository.interface.js';
import { AccountEntity } from '../entities/account.entity.js';

describe('DefaultHierarchyCheckerService', () => {
    let service: DefaultHierarchyCheckerService;
    
    // Declaração explícita do mock do repositório com tipagem flexível para testes
    let repositoryMock: {
        findRootByClass: any;
        findByParentAndIndex: any;
        findByParent: any;
    };

    beforeEach(() => {
        repositoryMock = {
            findRootByClass: vi.fn(),
            findByParentAndIndex: vi.fn(),
            findByParent: vi.fn(),
        };

        // Injeta o mock simulando a inversão de dependência da camada de Infraestrutura
        service = new DefaultHierarchyCheckerService(repositoryMock as unknown as AccountRepository);
    });

    describe('existsRootWithSameClass - Validação de Raiz Duplicada', () => {
        test.each([
            { repoResult: { id: 'root-uuid-1' }, expected: true, cenario: 'já existir uma conta raiz para a classe informada' },
            { repoResult: null,                  expected: false, cenario: 'não existir nenhuma conta raiz para a classe informada' }
        ])('deve retornar $expected quando $cenario', async ({ repoResult, expected }) => {
            const mockAccount = { accountClass: 'ASSET' } as unknown as AccountEntity;
            repositoryMock.findRootByClass.mockResolvedValue(repoResult);

            const result = await service.existsRootWithSameClass(mockAccount);

            expect(result).toBe(expected);
            expect(repositoryMock.findRootByClass).toHaveBeenCalledWith('ASSET');
            expect(repositoryMock.findRootByClass).toHaveBeenCalledTimes(1);
        });
    });

    describe('isIndexUsedBySiblings - Validação de Conflito de Posição (localIndex)', () => {
        test.each([
            { repoResult: { id: 'sibling-uuid' }, expected: true, cenario: 'o índice local já estiver ocupado por uma conta irmã' },
            { repoResult: null,                  expected: false, cenario: 'o índice local estiver totalmente livre no nível atual' }
        ])('deve retornar $expected quando $cenario', async ({ repoResult, expected }) => {
            const mockParent = { id: 'parent-uuid' } as unknown as AccountEntity;
            const mockAccount = { parent: mockParent, localIndex: 3 } as unknown as AccountEntity;
            repositoryMock.findByParentAndIndex.mockResolvedValue(repoResult);

            const result = await service.isIndexUsedBySiblings(mockAccount);

            expect(result).toBe(expected);
            expect(repositoryMock.findByParentAndIndex).toHaveBeenCalledWith(mockParent, 3);
            expect(repositoryMock.findByParentAndIndex).toHaveBeenCalledTimes(1);
        });
    });

    describe('hasActiveChildren - Validação de Propagação de Inativação', () => {
        test('deve retornar false imediatamente e NÃO consultar o banco se a conta for analítica (!isSummary)', async () => {
            const mockAccount = { isSummary: false } as unknown as AccountEntity;

            const result = await service.hasActiveChildren(mockAccount);

            expect(result).toBe(false);
            // Curto-circuito: O repositório jamais deve ser onerado se a conta não for sintética
            expect(repositoryMock.findByParent).not.toHaveBeenCalled();
        });

        test.each([
            { children: [{ isActive: false }, { isActive: true }],  expected: true,  cenario: 'possuir pelo menos um nó filho ativo' },
            { children: [{ isActive: false }, { isActive: false }], expected: false, cenario: 'todos os nós filhos estarem inativos' },
            { children: [],                                         expected: false, cenario: 'a conta de resumo não tiver nenhum filho' }
        ])('deve retornar $expected quando a conta for sintética e $cenario', async ({ children, expected }) => {
            const mockAccount = { isSummary: true } as unknown as AccountEntity;
            repositoryMock.findByParent.mockResolvedValue(children);

            const result = await service.hasActiveChildren(mockAccount);

            expect(result).toBe(expected);
            expect(repositoryMock.findByParent).toHaveBeenCalledWith(mockAccount);
        });
    });

    describe('hasNonContraChildren - Invariante de Estrutura de Contra-Contas', () => {
        test('deve retornar false imediatamente e NÃO consultar o banco se a conta for analítica (!isSummary)', async () => {
            const mockAccount = { isSummary: false } as unknown as AccountEntity;

            const result = await service.hasNonContraChildren(mockAccount);

            expect(result).toBe(false);
            expect(repositoryMock.findByParent).not.toHaveBeenCalled();
        });

        test.each([
            { children: [{ isContra: true }, { isContra: false }], expected: true,  cenario: 'possuir pelo menos uma subconta normal' },
            { children: [{ isContra: true }, { isContra: true }],  expected: false, cenario: 'todas as subcontas também forem contra-contas' },
            { children: [],                                        expected: false, cenario: 'a conta de resumo não possuir subcontas' }
        ])('deve retornar $expected quando a conta for sintética e $cenario', async ({ children, expected }) => {
            const mockAccount = { isSummary: true } as unknown as AccountEntity;
            repositoryMock.findByParent.mockResolvedValue(children);

            const result = await service.hasNonContraChildren(mockAccount);

            expect(result).toBe(expected);
            expect(repositoryMock.findByParent).toHaveBeenCalledWith(mockAccount);
        });
    });
});