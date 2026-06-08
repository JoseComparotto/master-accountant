import { describe, test, expect, vi, beforeEach } from 'vitest';
import { AccountEntity } from './account.entity.js';
import { AccountClassEnum } from '../enums/account-class.enum.js';
import { BalanceTypeEnum } from '../enums/balance-type.enum.js';
import { AccountInvariantViolationException } from '../exceptions/account.exception.js';
import type { IHierarchyCheckerService } from '../interfaces/hierarchy-checker.interface.js';
import { UuidValue } from '../../../shared/value-objects/uuid.value.js';
import { AccountNameValue } from '../value-objects/account-name.value.js';
import { StructuralCodeValue } from '../value-objects/structural-code.value.js';

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

    describe('Reconstituição de Estado e Validação de Getters', () => {
        test('reconstitute - deve remontar a entidade perfeitamente a partir do estado persistido e validar todos os getters', () => {
            const id = UuidValue.generate();
            const name = AccountNameValue.create('CONTA RECONSTITUIDA');
            const structuralCode = StructuralCodeValue.createRoot(1);

            const props = {
                id,
                name,
                description: 'Descrição de teste reconstituição',
                parent: null,
                structuralCode,
                localIndex: 1,
                accountClass: AccountClassEnum.ASSET,
                isSummary: true,
                isContra: false,
                isActive: true,
            };

            const account = AccountEntity.reconstitute(props);

            // Garante o mapeamento individual de cada getter público
            expect(account.id).toBe(id);
            expect(account.name).toBe(name);
            expect(account.description).toBe('Descrição de teste reconstituição');
            expect(account.parent).toBeNull();
            expect(account.parentId).toBeNull(); // Testa o fallback do parentId para nulo
            expect(account.localIndex).toBe(1);
            expect(account.structuralCode).toBe(structuralCode);
            expect(account.accountClass).toBe(AccountClassEnum.ASSET);
            expect(account.isSummary).toBe(true);
            expect(account.isContra).toBe(false);
            expect(account.isActive).toBe(true);
        });

        test('parentId - deve retornar o id do pai corretamente quando a conta possuir um pai associado', async () => {
            const parentProps = { name: 'CONTA PAI', accountClass: AccountClassEnum.ASSET, localIndex: 1, isSummary: true };
            const parent = await AccountEntity.createRoot(parentProps, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            const child = await AccountEntity.createChild(
                { name: 'CONTA FILHA', localIndex: 1, isSummary: false, parent },
                hierarchyCheckerMock as unknown as IHierarchyCheckerService
            );

            expect(child.parentId).toEqual(parent.id);
        });
    });

    describe('patchMetadata - Branches Alternativas (Campos Omitidos/Undefined)', () => {
        test('deve atualizar apenas o nome se a descrição for omitida no patch', async () => {
            const props = { name: 'Nome Original', accountClass: AccountClassEnum.ASSET, localIndex: 1, isSummary: false, description: 'Desc Original' };
            const account = await AccountEntity.createRoot(props, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            account.patchMetadata({ name: 'Nome Alterado' });

            expect(account.name.value).toBe('Nome Alterado');
            expect(account.description).toBe('Desc Original'); // Permaneceu intacto
        });

        test('deve atualizar apenas a descrição se o nome for omitido no patch', async () => {
            const props = { name: 'Nome Original', accountClass: AccountClassEnum.ASSET, localIndex: 1, isSummary: false, description: 'Desc Original' };
            const account = await AccountEntity.createRoot(props, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            account.patchMetadata({ description: 'Desc Alterada' });

            expect(account.name.value).toBe('Nome Original'); // Permaneceu intacto
            expect(account.description).toBe('Desc Alterada');
        });
    });

    describe('applyContraLogic - Caminho Feliz e Invariante de Pai Contra', () => {
        test('deve alterar o status de contra-conta com sucesso (Caminho Feliz)', async () => {
            const props = { name: 'Conta Padrão', accountClass: AccountClassEnum.ASSET, localIndex: 1, isSummary: false };
            const account = await AccountEntity.createRoot(props, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            await account.applyContraLogic(true, hierarchyCheckerMock as unknown as IHierarchyCheckerService);
            expect(account.isContra).toBe(true);
        });

        test('deve lançar exceção COA-02 se tentar desmarcar isContra quando o pai for uma conta Contra', async () => {
            const parentProps = { name: 'Pai Contra', accountClass: AccountClassEnum.ASSET, localIndex: 1, isSummary: true, isContra: true };
            const parent = await AccountEntity.createRoot(parentProps, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            // O filho herda por padrão o isContra: true do pai
            const child = await AccountEntity.createChild(
                { name: 'Filho Herdeiro', localIndex: 1, isSummary: false, parent },
                hierarchyCheckerMock as unknown as IHierarchyCheckerService
            );

            // Tenta forçar isContra para false no filho
            await expect(
                child.applyContraLogic(false, hierarchyCheckerMock as unknown as IHierarchyCheckerService)
            ).rejects.toThrow(AccountInvariantViolationException);
        });
    });

    describe('activate - Ativação do Ciclo de Vida', () => {
        test('deve ativar uma conta inativa com sucesso quando ela não possuir pai', async () => {
            const props = { name: 'Raiz Inativa', accountClass: AccountClassEnum.ASSET, localIndex: 1, isSummary: false, isActive: false };
            const account = await AccountEntity.createRoot(props, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            expect(account.isActive).toBe(false);
            account.activate();
            expect(account.isActive).toBe(true);
        });

        test('deve lançar exceção HTI-07 ao tentar ativar uma conta cujo pai está inativo', async () => {
            const parentProps = { name: 'Pai Inativo', accountClass: AccountClassEnum.ASSET, localIndex: 1, isSummary: true, isActive: false };
            const parent = await AccountEntity.createRoot(parentProps, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            // Criamos o filho explicitamente inativo para passar na validação de criação
            const child = await AccountEntity.createChild(
                { name: 'Filho Inativo', localIndex: 1, isSummary: false, parent, isActive: false },
                hierarchyCheckerMock as unknown as IHierarchyCheckerService
            );

            expect(() => child.activate()).toThrow(AccountInvariantViolationException);
        });
    });

    describe('Factories Estáticas - Geração de UUID no Fallback', () => {
        test('createRoot - deve gerar um UuidValue autônomo válido se id for omitido', async () => {
            const props = { name: 'Sem Id', accountClass: AccountClassEnum.ASSET, localIndex: 1, isSummary: false };
            const account = await AccountEntity.createRoot(props, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            expect(account.id).toBeInstanceOf(UuidValue);
            expect(account.id.value).toBeDefined();
        });

        test('createChild - deve gerar um UuidValue autônomo válido se id for omitido', async () => {
            const parentProps = { name: 'Pai Conectado', accountClass: AccountClassEnum.ASSET, localIndex: 1, isSummary: true };
            const parent = await AccountEntity.createRoot(parentProps, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            const child = await AccountEntity.createChild(
                { name: 'Filho Sem Id', localIndex: 1, isSummary: false, parent },
                hierarchyCheckerMock as unknown as IHierarchyCheckerService
            );

            expect(child.id).toBeInstanceOf(UuidValue);
            expect(child.id.value).toBeDefined();
        });
    });

    describe('validateHierarchicalRules - Exceções e Barreiras Não Dependentes de Serviços Externos', () => {
        test('HTI-03 - deve lançar exceção se o ID fornecido for idêntico ao do pai (Proibição de Auto-referência)', async () => {
            const parentProps = { name: 'Pai Sintético', accountClass: AccountClassEnum.ASSET, localIndex: 1, isSummary: true };
            const parent = await AccountEntity.createRoot(parentProps, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            // Envia propositalmente o ID do pai como ID do novo filho
            await expect(
                AccountEntity.createChild(
                    { id: parent.id.value, name: 'Filho Mutante', localIndex: 1, isSummary: false, parent },
                    hierarchyCheckerMock as unknown as IHierarchyCheckerService
                )
            ).rejects.toThrow(AccountInvariantViolationException);
        });

        test('HTI-04 - deve lançar exceção se tentar criar um filho sob um pai analítico/não-resumo', async () => {
            const parentProps = { name: 'Pai Analítico Final', accountClass: AccountClassEnum.ASSET, localIndex: 1, isSummary: false };
            const parent = await AccountEntity.createRoot(parentProps, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            await expect(
                AccountEntity.createChild(
                    { name: 'Filho Impossível', localIndex: 1, isSummary: false, parent },
                    hierarchyCheckerMock as unknown as IHierarchyCheckerService
                )
            ).rejects.toThrow(AccountInvariantViolationException);
        });

        test('HTI-07 - deve lançar exceção ao tentar criar/nascer uma conta filha ativa sob um pai já inativo', async () => {
            const parentProps = { name: 'Pai Congelado', accountClass: AccountClassEnum.ASSET, localIndex: 1, isSummary: true, isActive: false };
            const parent = await AccountEntity.createRoot(parentProps, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            await expect(
                AccountEntity.createChild(
                    { name: 'Filho Rebelde Ativo', localIndex: 1, isSummary: false, parent, isActive: true },
                    hierarchyCheckerMock as unknown as IHierarchyCheckerService
                )
            ).rejects.toThrow(AccountInvariantViolationException);
        });

        test('COA-01 - deve lançar exceção se uma classe contábil for informada e divergir da classe do pai', async () => {
            const parentProps = { name: 'Pai Ativo', accountClass: AccountClassEnum.ASSET, localIndex: 1, isSummary: true };
            const parent = await AccountEntity.createRoot(parentProps, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            await expect(
                AccountEntity.createChild(
                    { name: 'Filho Conflitante', localIndex: 1, isSummary: false, parent, accountClass: AccountClassEnum.LIABILITY },
                    hierarchyCheckerMock as unknown as IHierarchyCheckerService
                )
            ).rejects.toThrow(AccountInvariantViolationException);
        });

        test('COA-02 - deve lançar exceção se o pai for Contra mas o filho for forçado como Não-Contra na instanciação', async () => {
            const parentProps = { name: 'Pai Reverso', accountClass: AccountClassEnum.ASSET, localIndex: 1, isSummary: true, isContra: true };
            const parent = await AccountEntity.createRoot(parentProps, hierarchyCheckerMock as unknown as IHierarchyCheckerService);

            await expect(
                AccountEntity.createChild(
                    { name: 'Filho Normal Ilegal', localIndex: 1, isSummary: false, parent, isContra: false },
                    hierarchyCheckerMock as unknown as IHierarchyCheckerService
                )
            ).rejects.toThrow(AccountInvariantViolationException);
        });
    });
});