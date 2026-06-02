import { describe, it, expect, vi, beforeEach } from "vitest";
import { AccountDomainService } from './account-domain.service.js';
import { AccountEntity } from '../entities/account.entity.js';
import { AccountClassEnum } from '../enums/account-class.enum.js';
import type { IAccountRepository } from '../interfaces/account-repository.interface.js';
import { StructuralCodeValue } from "../value-objects/structural-code.value.js";

describe('AccountDomainService', () => {

    const mockUUID = (sequence: number): string => {
        return `00000000-0000-4000-8000-${sequence.toString().padStart(12, '0')}`;
    }

    let service: AccountDomainService;
    let repository: IAccountRepository;

    // Helper para criar mock de repositório
    beforeEach(() => {
        repository = {
            findRootByClass: vi.fn(),
            isIndexUsedBySiblings: vi.fn(),
            findByParent: vi.fn(),
        } as unknown as IAccountRepository;

        service = new AccountDomainService(repository);
    });

    describe('createAccount', () => {
        it('should successfully create a root account when no other root exists (HTI-01)', async () => {
            vi.mocked(repository.findRootByClass).mockResolvedValue(null);
            vi.mocked(repository.isIndexUsedBySiblings).mockResolvedValue(false);

            const account = await service.createAccount({
                name: 'Assets',
                description: null,
                parent: null,
                localIndex: 1,
                accountClass: AccountClassEnum.ASSET,
                isSummary: true
            });

            expect(account).toBeDefined();
            expect(repository.findRootByClass).toHaveBeenCalledWith(AccountClassEnum.ASSET);
        });

        it('should throw DomainException when trying to create a second root for the same class (HTI-01)', async () => {
            const existingRoot = AccountEntity.reconstitute({
                id: mockUUID(1),
                name: 'Existing Asset Root',
                description: null,
                parent: null,
                localIndex: 1,
                structuralCode: StructuralCodeValue.createRoot(1),
                accountClass: AccountClassEnum.ASSET,
                isSummary: true,
                isActive: true,
                isContra: false,
            });

            vi.mocked(repository.findRootByClass).mockResolvedValue(existingRoot);

            await expect(service.createAccount({
                name: 'Duplicate Assets',
                description: null,
                parent: null,
                localIndex: 1,
                accountClass: AccountClassEnum.ASSET,
                isSummary: true
            })).rejects.toThrow(/HTI-01/);
            expect(repository.findRootByClass).toHaveBeenCalledWith(AccountClassEnum.ASSET);

        });

        it('should throw DomainException when local index is already taken by a sibling (HTI-08)', async () => {
            const parent = AccountEntity.reconstitute({
                id: mockUUID(1),
                name: 'Parent Account',
                description: null,
                parent: null,
                localIndex: 1,
                structuralCode: StructuralCodeValue.createRoot(1),
                accountClass: AccountClassEnum.ASSET,
                isSummary: true,
                isContra: false,
                isActive: true,
            })

            vi.mocked(repository.findRootByClass).mockResolvedValue(null);
            vi.mocked(repository.isIndexUsedBySiblings).mockResolvedValue(true);

            await expect(service.createAccount({
                name: 'Conflicting Account',
                parent: parent,
                localIndex: 2,
                isSummary: true
            })).rejects.toThrow(/HTI-08/);

            expect(repository.isIndexUsedBySiblings).toHaveBeenCalledWith(parent.id, 2);

        });

        it('should throw DomainException when local index is already taken by another root (HTI-08)', async () => {
            vi.mocked(repository.findRootByClass).mockResolvedValue(null);
            vi.mocked(repository.isIndexUsedBySiblings).mockResolvedValue(true);

            await expect(service.createAccount({
                name: 'Conflicting Account',
                description: null,
                parent: null,
                localIndex: 2,
                accountClass: AccountClassEnum.ASSET,
                isSummary: true
            })).rejects.toThrow(/HTI-08/);

            expect(repository.isIndexUsedBySiblings).toHaveBeenCalledWith(undefined, 2);

        });
    });

    describe('activateAccount', () => {
        it('should call the activate method on the entity', () => {
            const account = AccountEntity.reconstitute({
                id: mockUUID(1),
                name: 'Inactive Account',
                description: null,
                parent: null,
                localIndex: 1,
                structuralCode: StructuralCodeValue.createRoot(1),
                accountClass: AccountClassEnum.ASSET,
                isSummary: false,
                isContra: false,
                isActive: false,
            });

            const activateSpy = vi.spyOn(account, 'activate');
            service.activateAccount(account);

            expect(activateSpy).toHaveBeenCalled();
        });
    });

    describe('inactivateAccount', () => {
        it('should allow inactivating a leaf (posting) account without checking children', async () => {
            const account = AccountEntity.reconstitute({
                id: mockUUID(1),
                name: 'Leaf Account',
                description: null,
                parent: null,
                isSummary: false,
                isActive: true,
                localIndex: 1,
                structuralCode: StructuralCodeValue.createRoot(1),
                accountClass: AccountClassEnum.ASSET,
                isContra: false,
            });

            await service.inactivateAccount(account);

            expect(account.isActive).toBe(false);
            expect(repository.findByParent).not.toHaveBeenCalled();
        });

        it('should allow inactivating a summary account if all children are inactive (HTI-07)', async () => {
            const summary = AccountEntity.reconstitute({
                id: mockUUID(1),
                name: 'Summary Account',
                description: null,
                parent: null,
                isSummary: true,
                isActive: true,
                localIndex: 1,
                structuralCode: StructuralCodeValue.createRoot(1),
                accountClass: AccountClassEnum.ASSET,
                isContra: false,
            });

            vi.mocked(repository.findByParent).mockResolvedValue([
                AccountEntity.reconstitute({
                    id: mockUUID(1),
                    isActive: false,
                    name: 'C1',
                    description: null,
                    parent: null,
                    localIndex: 1,
                    structuralCode: StructuralCodeValue.createRoot(1),
                    accountClass: AccountClassEnum.ASSET,
                    isSummary: false,
                    isContra: false,
                })
            ]);

            await service.inactivateAccount(summary);

            expect(summary.isActive).toBe(false);
        });

        it('should throw DomainException when inactivating a summary account with active children (HTI-07)', async () => {
            const summary = AccountEntity.reconstitute({
                id: mockUUID(1),
                name: 'Summary Account',
                description: null,
                parent: null,
                isSummary: true,
                isActive: true,
                localIndex: 1,
                structuralCode: StructuralCodeValue.createRoot(1),
                accountClass: AccountClassEnum.ASSET,
                isContra: false,
            });

            vi.mocked(repository.findByParent).mockResolvedValue([
                AccountEntity.reconstitute({
                    id: mockUUID(1),
                    isActive: true,
                    name: 'Active Child',
                    description: null,
                    parent: null,
                    localIndex: 1,
                    structuralCode: StructuralCodeValue.createRoot(1),
                    accountClass: AccountClassEnum.ASSET,
                    isSummary: false,
                    isContra: false,
                })
            ]);

            await expect(service.inactivateAccount(summary)).rejects.toThrow(/HTI-07/);
        });
    });

    describe('updateAccountMetadata', () => {
        it('should call the updateMetadata method on the entity', () => {
            const account = AccountEntity.reconstitute({
                id: mockUUID(1),
                name: 'Old Name',
                description: 'Old Description',
                parent:null,
                localIndex: 1,
                structuralCode: StructuralCodeValue.createRoot(1),
                accountClass: AccountClassEnum.ASSET,
                isSummary: false,
                isContra: false,
                isActive: true,
            });

            const updateSpy = vi.spyOn(account, 'updateMetadata');
            service.updateAccountMetadata(account, 'New Name', 'New Description');

            expect(updateSpy).toHaveBeenCalledWith('New Name', 'New Description');
            expect(account.name).toBe('New Name');
            expect(account.description).toBe('New Description');
        });
    });
});