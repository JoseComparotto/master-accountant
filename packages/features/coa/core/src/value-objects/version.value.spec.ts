import { describe, it, expect } from 'vitest';
import { VersionValue } from './version.value.js';
import { ValueObjectMalformedException } from '@repo/shared-core';

describe('VersionValue Unit Tests', () => {
    
    describe('Success Cases', () => {
        it('should create a valid VersionValue when given a positive integer', () => {
            const validVersion = 1;
            const version = VersionValue.create(validVersion);

            expect(version).toBeDefined();
            expect(version.value).toBe(validVersion); 
        });

        it('should accept large positive integers', () => {
            const largeVersion = 150;
            const version = VersionValue.create(largeVersion);
            
            expect(version.value).toBe(largeVersion);
        });

        it('should create a valid VersionValue when given zero', () => {
            const validVersion = 0;
            const version = VersionValue.create(validVersion);

            expect(version).toBeDefined();
            expect(version.value).toBe(validVersion); 
        });

    });

    describe('Failure Cases', () => {
        it('should throw ValueObjectMalformedException when version is a negative integer', () => {
            expect(() => {
                VersionValue.create(-5);
            }).toThrow(ValueObjectMalformedException);
        });

        it('should throw ValueObjectMalformedException when version is a float/decimal number', () => {
            expect(() => {
                VersionValue.create(1.5);
            }).toThrow(ValueObjectMalformedException);
        });

        it('should throw ValueObjectMalformedException when type is not a number (runtime guard)', () => {
            // Forçando tipos inválidos com 'as any' para garantir que a validação de runtime funcione
            expect(() => {
                VersionValue.create('1' as unknown as number);
            }).toThrow(ValueObjectMalformedException);

            expect(() => {
                VersionValue.create(null as unknown as number);
            }).toThrow(ValueObjectMalformedException);

            expect(() => {
                VersionValue.create(undefined as unknown as number);
            }).toThrow(ValueObjectMalformedException);
        });
    });

    describe('Value Object Equality', () => {
        it('should consider two instances with the same value as equal', () => {
            const versionA = VersionValue.create(2);
            const versionB = VersionValue.create(2);

            expect(versionA.equals(versionB)).toBe(true);
        });
    });
});