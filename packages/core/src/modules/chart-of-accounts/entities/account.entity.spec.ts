import { describe, test, expect, vi, beforeEach } from 'vitest';
import { AccountEntity } from './account.entity.js';
import { AccountClassEnum } from '../enums/account-class.enum.js';
import { BalanceTypeEnum } from '../enums/balance-type.enum.js';
import { AccountInvariantViolationException } from '../exceptions/account.exception.js';
import type { IHierarchyCheckerService } from '../interfaces/hierarchy-checker.interface.js';

describe('AccountEntity - O Coração do Domínio (Aggregate Root)', () => {
    let hierarchyCheckerMock: {
        existsRootWithSameClass: any;
        isIndexUsedBySiblings: any;
        hasActiveChildren: any;
        hasNonContraChildren: any;
    };

    beforeEach(() => {
        hierarchyCheckerMock = {
            existsRootWithSameClass: vi.fn().mockResolvedValue(false),
            isIndexUsedBySiblings: vi.fn().mockResolvedValue(false),
            hasActiveChildren: vi.fn().mockResolvedValue(false),
            hasNonContraChildren: vi.fn().mockResolvedValue(false),
        };
    });

    describe('Factories Estáticas e Integridade Hierárquica', () => {
        test('createRoot - deve instanciar com sucesso uma conta raiz válida e gerar o código estrutural inicial', async () => {
            const props = {
                name: 'ATIVO',
                accountClass: AccountClassEnum.ASSET,
                localIndex: 1,
                isSummary: true,
                description: 'Contas de Ativo Global'
            };

            const root = await AccountEntity.createRoot(props, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            expect(root.id).toBeDefined();
            expect(root.accountClass).toBe(AccountClassEnum.ASSET);
            expect(root.structuralCode.value).toBe('1'); // Código determinístico baseado no localIndex
            expect(hierarchyCheckerMock.existsRootWithSameClass).toHaveBeenCalledWith(expect.any(AccountEntity));
        });

        test('createRoot - deve lançar exceção se o consultor de hierarquia detectar outra raiz com a mesma classe contábil', async () => {
            hierarchyCheckerMock.existsRootWithSameClass.mockResolvedValue(true);

            const props = {
                name: 'OUTRO ATIVO',
                accountClass: AccountClassEnum.ASSET,
                localIndex: 2,
                isSummary: true
            };

            await expect(
                AccountEntity.createRoot(props, hierarchyCheckerMock as unknown as IHierarchyCheckerService)
            ).rejects.toThrow(AccountInvariantViolationException);
        });

        test('createChild - deve herdar a classe contábil do pai e calcular o código estrutural incremental', async () => {
            // 1. Arrange: Instancia uma conta pai de Ativo (Código "1")
            const parentProps = { name: 'ATIVO', accountClass: AccountClassEnum.ASSET, localIndex: 1, isSummary: true };
            const parent = await AccountEntity.createRoot(parentProps, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            const childProps = {
                name: 'ATIVO CIRCULANTE',
                localIndex: 2,
                isSummary: true
            };

            // 2. Act: Cria a conta filha
            const child = await AccountEntity.createChild(
                { ...childProps, parent }, 
                hierarchyCheckerMock as unknown as IHierarchyCheckerService
            );

            // 3. Assert: Invariante NAT-02 e Geração de Código Protegidas
            expect(child.accountClass).toBe(AccountClassEnum.ASSET); // Herança de Classe garantida
            expect(child.structuralCode.value).toBe('1.2'); // "1" (pai) + "." + "2" (filho localIndex)
            expect(hierarchyCheckerMock.isIndexUsedBySiblings).toHaveBeenCalledWith(expect.any(AccountEntity));
        });

        test('createChild - deve barrar o nascimento do nó se o localIndex já estiver ocupado por um irmão', async () => {
            const parentProps = { name: 'PASSIVO', accountClass: AccountClassEnum.LIABILITY, localIndex: 2, isSummary: true };
            const parent = await AccountEntity.createRoot(parentProps, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            hierarchyCheckerMock.isIndexUsedBySiblings.mockResolvedValue(true); // Conflito de posição simulado

            await expect(
                AccountEntity.createChild(
                    { name: 'Ocupado', localIndex: 1, isSummary: false, parent }, 
                    hierarchyCheckerMock as unknown as IHierarchyCheckerService
                )
            ).rejects.toThrow(AccountInvariantViolationException);
        });
    });

    describe('Estado Derivado e a Fórmula Epistêmica Contábil (balanceType)', () => {
        // Matriz Verdade do XOR Contábil: balanceType := accountClass in {Asset, Expense} XOR isContra
        test.each([
            { classType: AccountClassEnum.ASSET,     isContra: false, expected: BalanceTypeEnum.DEBIT },
            { classType: AccountClassEnum.ASSET,     isContra: true,  expected: BalanceTypeEnum.CREDIT },
            { classType: AccountClassEnum.EXPENSE,   isContra: false, expected: BalanceTypeEnum.DEBIT },
            { classType: AccountClassEnum.EXPENSE,   isContra: true,  expected: BalanceTypeEnum.CREDIT },
            { classType: AccountClassEnum.LIABILITY, isContra: false, expected: BalanceTypeEnum.CREDIT },
            { classType: AccountClassEnum.LIABILITY, isContra: true,  expected: BalanceTypeEnum.DEBIT },
            { classType: AccountClassEnum.EQUITY,    isContra: false, expected: BalanceTypeEnum.CREDIT },
            { classType: AccountClassEnum.EQUITY,    isContra: true,  expected: BalanceTypeEnum.DEBIT },
            { classType: AccountClassEnum.INCOME,    isContra: false, expected: BalanceTypeEnum.CREDIT },
            { classType: AccountClassEnum.INCOME,    isContra: true,  expected: BalanceTypeEnum.DEBIT },
        ])('deve mapear para $expected quando a classe for $classType e isContra for $isContra', async ({ classType, isContra, expected }) => {
            const props = { name: 'Conta Teste', accountClass: classType, localIndex: 1, isSummary: true, isContra };
            const account = await AccountEntity.createRoot(props, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            // Validação do Getter Dinâmico Puro (Zero Persistência Redundante no Banco)
            expect(account.balanceType).toBe(expected);
        });
    });

    describe('Mutações, Ciclo de Vida e Regras de Negócio Avançadas', () => {
        test('patchMetadata - deve alterar dados textuais e higienizar o nome via Value Object', async () => {
            const props = { name: ' Nome Sujo Com Espaço   ', accountClass: AccountClassEnum.ASSET, localIndex: 1, isSummary: false };
            const account = await AccountEntity.createRoot(props, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            account.patchMetadata({ name: '  NOVO NOME HIGIENIZADO  ', description: 'Nova Descrição' });

            expect(account.name.value).toBe('NOVO NOME HIGIENIZADO'); // Higienização pelo VO AccountName
            expect(account.description).toBe('Nova Descrição');
        });

        test('inactivate - deve permitir a inativação se a conta não possuir filhos ativos', async () => {
            const props = { name: 'Sintética', accountClass: AccountClassEnum.ASSET, localIndex: 1, isSummary: true };
            const account = await AccountEntity.createRoot(props, hierarchyCheckerMock as unknown as IHierarchyCheckerService);
            
            hierarchyCheckerMock.hasActiveChildren.mockResolvedValue(false);

            await account.inactivate(hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            expect(account.isActive).toBe(false);
        });

        test('inactivate - deve estourar erro se houver tentativa de inativar uma conta com filhos ainda ativos (Regra HTR-05)', async () => {
            const props = { name: 'Mãe Protetora', accountClass: AccountClassEnum.ASSET, localIndex: 1, isSummary: true };
            const account = await AccountEntity.createRoot(props, hierarchyCheckerMock as unknown as IHierarchyCheckerService);
            
            hierarchyCheckerMock.hasActiveChildren.mockResolvedValue(true); // Filhos ativos encontrados!

            await expect(
                account.inactivate(hierarchyCheckerMock as unknown as IHierarchyCheckerService)
            ).rejects.toThrow(AccountInvariantViolationException);
            
            expect(account.isActive).toBe(true); // Estado original preservado
        });

        test('applyContraLogic - deve barrar a transformação em conta Contra se ela possuir filhos normais (Invariante COA-02)', async () => {
            const props = { name: 'Sintética Alvo', accountClass: AccountClassEnum.ASSET, localIndex: 1, isSummary: true };
            const account = await AccountEntity.createRoot(props, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            hierarchyCheckerMock.hasNonContraChildren.mockResolvedValue(true); // Existem filhos normais lá embaixo

            await expect(
                account.applyContraLogic(true, hierarchyCheckerMock as unknown as IHierarchyCheckerService)
            ).rejects.toThrow(AccountInvariantViolationException);
        });
    });

    describe('Algoritmos de Ordenação Contábil (Weight & Hierarchy)', () => {
        test('compareTo e sortByCode - deve ordenar uma lista de entidades respeitando o peso matemático dos códigos estruturais', async () => {
            const mockRootProps = { accountClass: AccountClassEnum.ASSET, isSummary: true };
            
            const a1 = await AccountEntity.createRoot({ ...mockRootProps, name: 'Ativo', localIndex: 1 }, hierarchyCheckerMock as unknown as IHierarchyCheckerService);
            const a1_1 = await AccountEntity.createChild({ name: 'Circulante', localIndex: 1, isSummary: true, parent: a1 }, hierarchyCheckerMock as unknown as IHierarchyCheckerService);
            const a1_2 = await AccountEntity.createChild({ name: 'Não Circulante', localIndex: 2, isSummary: true, parent: a1 }, hierarchyCheckerMock as unknown as IHierarchyCheckerService);
            const a1_1_1 = await AccountEntity.createChild({ name: 'Caixa', localIndex: 1, isSummary: false, parent: a1_1 }, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            // Array propositalmente bagunçado fora de ordem hierárquica
            const unorderedList = [a1_2, a1_1_1, a1, a1_1];

            // Executa a ordenação canônica estática
            const orderedList = unorderedList.sort(AccountEntity.sortByCode);

            // O resultado esperado deve espelhar fielmente a árvore contábil real do balanço
            expect(orderedList[0].structuralCode.value).toBe('1');
            expect(orderedList[1].structuralCode.value).toBe('1.1');
            expect(orderedList[2].structuralCode.value).toBe('1.1.1');
            expect(orderedList[3].structuralCode.value).toBe('1.2');
        });
    });
});