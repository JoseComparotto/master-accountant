import { describe, it, expect } from "vitest";
import { AccountClassEnum } from '../enums/account-class.enum.js';
import { AccountEntity, AccountProps, CreateAccountProps, CreateRootAccountProps } from './account.entity.js';
import { StructuralCodeValue } from "../value-objects/structural-code.value.js";

/**
 * Esta suite deve demonstrar: 
 * - COA-01: Herança de Classe
 * - COA-02: Propagação de Contra Account
 * - HTI-03: Proibição de Auto-referência
 * - HTI-04: Restrição de Paternidade Exclusiva para Contas de Sintéticas
 * - HTI-07: Restrição de Atividade entre Pais e Filhos
 * - HTI-10: Derivação de Código Estrutural
 * 
 * See: docs\domain\chart-of-accounts.md
 */

describe('AccountEntity', () => {

    // Mock de uma conta raiz para facilitar os testes de descendentes
    const createRootMock = (overrides?: Partial<CreateRootAccountProps>) => AccountEntity.createRoot({
        id: 'root-id',
        name: 'Ativo',
        localIndex: 1,
        accountClass: AccountClassEnum.ASSET,
        isSummary: true,
        isActive: true,
        isContra: false,
        ...overrides
    });

    describe('create', () => {

        describe('Happy Path (Caminho Feliz)', () => {
            it('should derive the structural code correctly (HTI-10)', () => {
                const root = createRootMock();

                const child = AccountEntity.createChild({
                    name: 'Ativo Circulante',
                    parent: root,
                    localIndex: 2,
                    accountClass: AccountClassEnum.ASSET, // Obrigatório bater com o pai (COA-01)
                    isSummary: true
                });

                // HTI-10: Structural Code deve ser o do pai + '.' + localIndex
                expect(child.structuralCode.toString()).toBe('1.2');
            });

            it('should propagate contra status from parent (COA-02)', () => {
                const root = createRootMock({
                    isContra: true // Definindo o root como contra para testar a propagação
                });

                const child = AccountEntity.createChild({
                    name: 'Conta Contra Teste',
                    parent: root,
                    localIndex: 1,
                    accountClass: AccountClassEnum.ASSET,
                    isSummary: false
                });

                // COA-02: Se o pai é contra, o filho deve ser obrigatoriamente
                expect(child.isContra).toBe(true);
            });

            // Deve propagar AccountClass se não for explicitamente definido
            it('should inherit account class from parent if not explicitly set (COA-01)', () => {
                const root = createRootMock({
                    accountClass: AccountClassEnum.LIABILITY // Definindo o root como Liability para testar a herança
                });

                const child = AccountEntity.createChild({
                    name: 'Conta Passivo Filha',
                    parent: root,
                    localIndex: 1,
                    isSummary: true
                });

                expect(child.accountClass).toBe(AccountClassEnum.LIABILITY)
            });
        });

        describe('Domain Invariants (Exceptions)', () => {

            it('shoud throw if trying to create a explicit non-contra child under a contra parent (COA-02)', () => {
                const root = createRootMock({
                    isContra: true
                });
                expect(() => AccountEntity.createChild({
                    name: 'Filho Não Contra',
                    parent: root,
                    localIndex: 1,
                    accountClass: AccountClassEnum.ASSET,
                    isSummary: false,
                    isContra: false
                })).toThrow(/COA-02/);
            });


            it('should throw if account is its own parent (HTI-03)', () => {
                const id = 'same-id';

                expect(() => AccountEntity.createChild({
                    id: id,
                    name: 'Self Reference',
                    parent: { id, structuralCode: StructuralCodeValue.createRoot(1) } as AccountEntity, // Simulando a conta como seu próprio pai
                    localIndex: 1,
                    accountClass: AccountClassEnum.ASSET,
                    isSummary: true
                })).toThrow(/HTI-03/); // Proibição de auto-referência
            });

            it('should throw if parent is a Posting Account (HTI-04)', () => {
                const postingAccount = createRootMock({
                    isSummary: false // forçando a conta a ser do tipo Posting Account
                });

                expect(() => AccountEntity.createChild({
                    name: 'Sub-conta inválida',
                    parent: postingAccount,
                    localIndex: 1,
                    accountClass: AccountClassEnum.ASSET,
                    isSummary: false
                })).toThrow(/HTI-04/); // Posting Account não pode ter filhos
            });

            it('should throw if account class differs from parent (COA-01)', () => {
                const root = createRootMock(); // É ASSET

                expect(() => AccountEntity.createChild({
                    name: 'Conta de Passivo no Ativo',
                    parent: root,
                    localIndex: 1,
                    accountClass: AccountClassEnum.LIABILITY, // Classe diferente do pai
                    isSummary: false
                })).toThrow(/COA-01/); // Deve herdar a classe do pai
            });

            it('should throw if trying to create an active child under an inactive parent (HTI-07)', () => {
                const inactiveParent = createRootMock({
                    isActive: false
                });

                expect(() => AccountEntity.createChild({
                    name: 'Filho Ativo',
                    parent: inactiveParent,
                    localIndex: 1,
                    accountClass: AccountClassEnum.ASSET,
                    isSummary: false,
                    isActive: true // Tentando ativar sob pai inativo
                })).toThrow(/HTI-07/); // Nó ativo não pode existir sob pai inativo
            });
        });
    });

    describe('reconstitute', () => {
        it('should restore an account entity from existing properties without side effects', () => {
            const props: AccountProps = {
                id: 'existing-uuid',
                name: 'Revenue Account',
                description: 'Operating Revenue',
                localIndex: 5,
                structuralCode: StructuralCodeValue.fromString('2.5'),
                accountClass: AccountClassEnum.REVENUE,
                isSummary: false,
                isContra: false,
                isActive: false,
            };

            const account = AccountEntity.reconstitute(props);

            expect(account.id).toBe(props.id);
            expect(account.name).toBe(props.name);
            expect(account.description).toBe(props.description);
            expect(account.localIndex).toBe(props.localIndex);
            expect(account.structuralCode.toString()).toBe(props.structuralCode.toString());
            expect(account.accountClass).toBe(props.accountClass);
            expect(account.isSummary).toBe(props.isSummary);
            expect(account.isContra).toBe(props.isContra);
            expect(account.isActive).toBe(props.isActive);
        });
    });

    describe('Metadata Mutations', () => {
        it('should allow updating name and description metadata', () => {
            const account = createRootMock();

            const name = 'Updated Asset Name';
            const description = 'Updated Description';

            account.updateMetadata(name, description);

            expect(account.name).toBe('Updated Asset Name');
            expect(account.description).toBe('Updated Description');
        });
    });

    describe('Status Mutations (HTI-07)', () => {
        it('should allow inactivating an active account', () => {
            const account = createRootMock({
                isActive: true
            });

            account.inactivate();

            expect(account.isActive).toBe(false);
        });

        it('should allow activating an inactive account when parent is active', () => {
            const parent = createRootMock({ isActive: true });
            const account = AccountEntity.reconstitute({
                id: 'child-id',
                parent,
                name: 'Child Account',
                localIndex: 1,
                structuralCode: parent.structuralCode.createChild(1),
                accountClass: AccountClassEnum.ASSET,
                isSummary: false,
                isContra: false,
                isActive: false
            });

            account.activate();

            expect(account.isActive).toBe(true);
        });

        it('should throw exception when trying to activate a child account of an inactive parent (HTI-07)', () => {
            const parent = createRootMock({ isActive: false });
            const account = AccountEntity.reconstitute({
                id: 'child-id',
                parent,
                name: 'Child Account',
                localIndex: 1,
                structuralCode: parent.structuralCode.createChild(1),
                accountClass: AccountClassEnum.ASSET,
                isSummary: false,
                isContra: false,
                isActive: false
            });

            // HTI-07: An active account MUST NOT have an inactive parent.
            expect(() => account.activate()).toThrow(/HTI-07/);
        });
    });

    describe('Getters Validation', () => {
        it('should successfully access all account properties through getters', () => {
            const parent = createRootMock();
            const account = AccountEntity.createChild({
                name: 'Checking Account',
                parent: parent,
                localIndex: 2,
                accountClass: AccountClassEnum.ASSET,
                isSummary: false,
                description: 'Bank account'
            });

            expect(account.id).toBeDefined();
            expect(account.name).toBe('Checking Account');
            expect(account.description).toBe('Bank account');
            expect(account.localIndex).toBe(2);
            expect(account.accountClass).toBe(AccountClassEnum.ASSET);
            expect(account.isSummary).toBe(false);
            expect(account.isContra).toBe(false);
            expect(account.isActive).toBe(true);
            expect(account.structuralCode.toString()).toBe('1.2');
            expect(account.parent).toBe(parent);
        });
    });
});