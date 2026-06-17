import { describe, it, expect } from 'vitest';
import { UuidValue } from './uuid.value.js';
import { ValueObjectMalformedException } from '../exception/domain.exception.js';

describe('UuidValue', () => {
    const VALID_UUID = '435165d5-2a4c-4235-95a9-dc34988e0db0';
    const VALID_UUID_UPPER = '435165D5-2A4C-4235-95A9-DC34988E0DB0';

    describe('Criação e Validação Inicial', () => {
        it('deve instanciar com sucesso quando fornecido um UUID válido', () => {
            const vo = UuidValue.create(VALID_UUID);

            expect(vo).toBeInstanceOf(UuidValue);
            expect(vo.value).toBe(VALID_UUID);
        });

        it('deve normalizar o valor para letras minúsculas automaticamente', () => {
            const vo = UuidValue.create(VALID_UUID_UPPER);

            expect(vo.value).toBe(VALID_UUID.toLowerCase());
        });
    });

    describe('Invariantes de Domínio', () => {
        it.each([
            { input: '', cenario: 'uma string vazia' },
            { input: '     ', cenario: 'apenas espaços em branco' },
            { input: 'texto-aleatorio', cenario: 'um texto comum sem formato' },
            { input: 'z0000000-0000-4000-8000-000000000000', cenario: 'caracteres inválidos (fora de hex)' },
            { input: '00000000-0000-4000-8000-00000000000', cenario: 'comprimento menor que o padrão' },
            { input: '00000000-0000-4000-8000-0000000000000', cenario: 'comprimento maior que o padrão' }
        ])('deve lançar ValueObjectMalformedException se o input for $cenario', ({ input }) => {

            expect(() => {
                UuidValue.create(input);
            }).toThrow(ValueObjectMalformedException);

        });
    });

    describe('Fábrica Automática Opcional (createOptional)', () => {
        it.each([
            { input: null, cenario: 'null' },
            { input: undefined, cenario: 'undefined' },
        ])('deve retornar undefined de forma segura se receber $cenario', ({ input }) => {
            const vo = UuidValue.createOptional(input);
            expect(vo).toBeUndefined();
        });

        it('deve criar o Value Object com sucesso se o valor opcional for preenchido corretamente', () => {
            const vo = UuidValue.createOptional(VALID_UUID);

            expect(vo).toBeInstanceOf(UuidValue);
            expect(vo?.value).toBe(VALID_UUID);
        });
    });

    describe('Geração Dinâmica (generate)', () => {
        it('deve gerar instâncias válidas e aleatórias usando o crypto nativo do ambiente', () => {
            const vo1 = UuidValue.generate();
            const vo2 = UuidValue.generate();

            // Garante que são válidos (não lançam exceção ao passar pela validação da classe)
            expect(() => UuidValue.create(vo1.value)).not.toThrow();
            expect(() => UuidValue.create(vo2.value)).not.toThrow();

            // Garante a aleatoriedade (independência de valores)
            expect(vo1.value).not.toBe(vo2.value);
        });
    });

    describe('Comparação de Igualdade Estática (UuidValue.equals)', () => {
        it('deve retornar true se ambos os parâmetros forem referências idênticas ou strings iguais', () => {
            const vo = UuidValue.create(VALID_UUID);

            expect(UuidValue.isEquals(vo, vo)).toBe(true);
            expect(UuidValue.isEquals(VALID_UUID, VALID_UUID)).toBe(true);
        });

        it('deve retornar true ao comparar uma instância de UuidValue contra uma string primitiva idêntica', () => {
            const vo = UuidValue.create(VALID_UUID);

            expect(UuidValue.isEquals<string, UuidValue>(vo, VALID_UUID)).toBe(true);
            expect(UuidValue.isEquals<string, UuidValue>(VALID_UUID, vo)).toBe(true);
        });

        it('deve retornar false se qualquer um dos termos comparados for nulo ou indefinido', () => {
            const vo = UuidValue.create(VALID_UUID);

            expect(UuidValue.isEquals(vo, null)).toBe(false);
            expect(UuidValue.isEquals(undefined, vo)).toBe(false);
        });

        it('deve retornar false se os UUIDs representarem valores de identidade diferentes', () => {
            const vo1 = UuidValue.create('11111111-1111-4111-8111-111111111111');
            const vo2 = UuidValue.create('22222222-2222-4222-8222-222222222222');

            expect(UuidValue.isEquals(vo1, vo2)).toBe(false);
            expect(UuidValue.isEquals<string, UuidValue>(vo1, '22222222-2222-4222-8222-222222222222')).toBe(false);
        });
    });
});