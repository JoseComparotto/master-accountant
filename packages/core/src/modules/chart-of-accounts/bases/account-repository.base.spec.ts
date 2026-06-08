import { beforeEach, describe, expect, it, vi } from "vitest";

import { BaseAccountRepository } from './account-repository.base'
import { AccountEntity } from "../entities/account.entity";
import { UuidValue } from "../../../shared/value-objects/uuid.value";
import { AccountExistsException } from "../exceptions/account.exception";

class MockAccountRepository extends BaseAccountRepository {
    findAll: any;
    findById: any;
    findByParent: any;
    findLastLocalIndex: any;
    findRootByClass: any;
    findByParentAndIndex: any;
    save: any;
}

describe('BaseAccountRepository', () => {

    let repo: MockAccountRepository;

    beforeEach(() => {
        repo = new MockAccountRepository();
        repo.findById = vi.fn();
    });

    describe('getById', () => {

        it('deve lançar exceção ao não encontrar a conta..', async () => {
            const mockResult = null;
            repo.findById.mockResolvedValue(mockResult);

            await expect(
                repo.getById('mock-id' as any as UuidValue)
            ).rejects.throw(AccountExistsException);

            expect(repo.findById).toHaveBeenCalledWith('mock-id');
        });

        // Caminho Feliz

        it('deve retornar a conta com id encontrado.', async () => {
            const mockResult = { id: 'mock-id' } as any as AccountEntity;
            repo.findById.mockResolvedValue(mockResult);

            const foundAccount = await repo.getById('mock-id' as any as UuidValue);

            expect(foundAccount).toBe(mockResult);
            expect(repo.findById).toHaveBeenCalledWith('mock-id');
        });

    });

});

