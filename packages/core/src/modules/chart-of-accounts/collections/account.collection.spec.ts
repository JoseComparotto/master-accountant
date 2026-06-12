import { describe, it, expect, beforeEach } from 'vitest';
import { AccountCollection } from './account.collection.js';
import { AccountEntity } from '../entities/account.entity.js';
import {
    AccountNotExistsWithIdException,
    AccountNotExistsWithCodeException,
    DuplicatedAccountCodeException,
    DuplicatedAccountIdException
} from '../exceptions/account.exception.js';

describe('AccountCollection', () => {
    // Helper para criar stubs de AccountEntity simulando os Value Objects internos
    const createMockAccount = (id: string, code: string, parentId: string | null = null): AccountEntity => {
        return {
            id: { value: id },
            structuralCode: { value: code },
            parentId: parentId ? { value: parentId } : null,
        } as unknown as AccountEntity;
    };

    let rootAccount: AccountEntity;
    let childAccount: AccountEntity;

    beforeEach(() => {
        rootAccount = createMockAccount('uuid-root', '1');
        childAccount = createMockAccount('uuid-child', '1.1', 'uuid-root');
    });

    describe('fromAccounts (Carga em Lote / Reconstituição)', () => {
        it('deve criar uma coleção com sucesso a partir de uma lista válida de contas', () => {
            const accounts = [rootAccount, childAccount];
            
            const collection = AccountCollection.fromAccounts(accounts);

            expect(collection.getAll()).toHaveLength(2);
            expect(collection.getById('uuid-root')).toBe(rootAccount);
            expect(collection.getById('uuid-child')).toBe(childAccount);
        });

        it('deve permitir a criação mesmo se as contas filhas vierem antes das contas pais no array', () => {
            // Ordem invertida (comum vindo de queries do banco de dados)
            const accounts = [childAccount, rootAccount];

            const collection = AccountCollection.fromAccounts(accounts);

            expect(collection.getAll()).toHaveLength(2);
            expect(collection.getByParentId('uuid-root')).toContain(childAccount);
        });

        it('deve lançar erro de integridade referencial se houver uma conta órfã no lote', () => {
            const ophanAccount = createMockAccount('uuid-orphan', '1.2', 'uuid-fantasma');
            const accounts = [rootAccount, ophanAccount];

            expect(() => {
                AccountCollection.fromAccounts(accounts);
            }).toThrow(AccountNotExistsWithIdException);
        });
    });

    describe('add (Inclusão em Tempo de Execução)', () => {
        let collection: AccountCollection;

        beforeEach(() => {
            collection = new AccountCollection();
        });

        it('deve adicionar uma conta raiz com sucesso', () => {
            collection.add(rootAccount);

            expect(collection.getAll()).toContain(rootAccount);
            expect(collection.getByParentId(null)).toContain(rootAccount);
        });

        it('deve adicionar uma conta filha com sucesso se o pai já existir na coleção', () => {
            collection.add(rootAccount);
            collection.add(childAccount);

            expect(collection.getAll()).toContain(childAccount);
            expect(collection.getByParentId('uuid-root')).toContain(childAccount);
        });

        it('deve lançar erro imediatamente se tentar adicionar uma conta filha cujo pai não existe na coleção', () => {
            expect(() => {
                collection.add(childAccount);
            }).toThrow(AccountNotExistsWithIdException);
        });

        it('deve lançar erro se tentar adicionar uma conta com ID já existente', () => {
            collection.add(rootAccount);
            const duplicateIdAccount = createMockAccount('uuid-root', '2');

            expect(() => {
                collection.add(duplicateIdAccount);
            }).toThrow(DuplicatedAccountIdException);
        });

        it('deve lançar erro se tentar adicionar uma conta com Código Estrutural já existente', () => {
            collection.add(rootAccount);
            const duplicateCodeAccount = createMockAccount('uuid-diferente', '1');

            expect(() => {
                collection.add(duplicateCodeAccount);
            }).toThrow(DuplicatedAccountCodeException);
        });
    });

    describe('Consultas e Getters', () => {
        let collection: AccountCollection;

        beforeEach(() => {
            collection = AccountCollection.fromAccounts([rootAccount, childAccount]);
        });

        it('deve buscar uma conta com sucesso pelo ID', () => {
            const account = collection.getById('uuid-root');
            expect(account).toBe(rootAccount);
        });

        it('deve lançar exceção ao buscar por um ID inexistente', () => {
            expect(() => {
                collection.getById('uuid-inexistente');
            }).toThrow(AccountNotExistsWithIdException);
        });

        it('deve buscar uma conta com sucesso pelo Código Estrutural', () => {
            const account = collection.getByCode('1.1');
            expect(account).toBe(childAccount);
        });

        it('deve lançar exceção ao buscar por um Código Estrutural inexistente', () => {
            expect(() => {
                collection.getByCode('9.9.9');
            }).toThrow(AccountNotExistsWithCodeException);
        });

        it('deve retornar as contas filhas corretas ao buscar pelo ID do pai', () => {
            const children = collection.getByParentId('uuid-root');
            expect(children).toHaveLength(1);
            expect(children[0]).toBe(childAccount);
        });

        it('deve retornar as contas raízes ao buscar por parentId nulo', () => {
            const roots = collection.getByParentId(null);
            expect(roots).toHaveLength(1);
            expect(roots[0]).toBe(rootAccount);
        });

        it('deve retornar um array vazio se o pai não possuir nenhuma conta filha', () => {
            const children = collection.getByParentId('uuid-child'); // Conta filha não tem filhos ainda
            expect(children).toEqual([]);
        });
    });
});