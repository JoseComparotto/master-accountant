import { describe, it, expect } from 'vitest';
import { AccountNameValue } from './account-name.value.js';
import { ValueObjectMalformedException } from '@repo/shared-core';

describe('AccountNameValue', () => {

    describe('Criação e Higienização (create)', () => {
        it('deve instanciar com sucesso e aplicar o trim eliminando espaços em branco supérfluos', () => {
            const vo = AccountNameValue.create('    Receitas de Vendas   ');

            expect(vo.value).toBe('Receitas de Vendas');
        });
    });

    describe('Validações e Invariantes de Domínio', () => {
        it.each([
            { input: null as any, cenario: 'null' },
            { input: '', cenario: 'vazio' },
            { input: '     ', cenario: 'composto apenas por espaços' }
        ])('deve lançar ValueObjectMalformedException se o nome for $cenario', ({ input }) => {

            expect(() => {
                AccountNameValue.create(input);
            }).toThrow(ValueObjectMalformedException);

        });

        it('deve lançar ValueObjectMalformedException se o nome higienizado for menor que 3 caracteres', () => {
            expect(() => {
                AccountNameValue.create('  Ab  '); // "Ab" tem tamanho 2 pós-trim
            }).toThrow(ValueObjectMalformedException);
        });

        it('deve lançar ValueObjectMalformedException se o nome exceder o limite estrito de 100 caracteres', () => {
            const nameExcedente = 'A'.repeat(101);

            expect(() => {
                AccountNameValue.create(nameExcedente);
            }).toThrow(ValueObjectMalformedException);
        });
    });

    describe('Fábrica Opcional (createOptional)', () => {
        it('deve retornar undefined imediatamente se o valor fornecido for null ou undefined', () => {
            expect(AccountNameValue.createOptional(null)).toBeUndefined();
            expect(AccountNameValue.createOptional(undefined)).toBeUndefined();
        });

        it('deve instanciar com sucesso o Value Object se um valor opcional preenchido e válido for enviado', () => {
            const vo = AccountNameValue.createOptional('Ativo Circulante');

            expect(vo).toBeInstanceOf(AccountNameValue);
            expect(vo?.value).toBe('Ativo Circulante');
        });

        it('deve disparar a validação da fábrica principal e lançar exceção se o valor opcional violar as regras', () => {
            expect(() => {
                AccountNameValue.createOptional('Oi'); // Curto demais
            }).toThrow(ValueObjectMalformedException);
        });
    });

    describe('Comparação por Valor (equals) - Flexível', () => {
        it('deve retornar true ao comparar com outra instância de AccountNameValue idêntica', () => {
            const name1 = AccountNameValue.create('Fornecedores');
            const name2 = AccountNameValue.create('Fornecedores');

            expect(name1.equals(name2)).toBe(true);
        });

        it('deve retornar true ao comparar com outra instância ignorando caixa alta/baixa (Case-Insensitive)', () => {
            const name1 = AccountNameValue.create('banco conta movimento');
            const name2 = AccountNameValue.create('BANCO CONTA MOVIMENTO');

            expect(name1.equals(name2)).toBe(true);
        });

        it('deve retornar true ao comparar diretamente com uma string primitiva idêntica ou com caixa diferente', () => {
            const vo = AccountNameValue.create('Ativo Circulante');

            // Testa a comparação com string primitiva pura
            expect(vo.equals('Ativo Circulante')).toBe(true);
            // Testa se ignora o case-sensitive na string primitiva
            expect(vo.equals('ativo circulante')).toBe(true);
        });

        it('deve aplicar o .trim() automaticamente na string primitiva antes de comparar', () => {
            const vo = AccountNameValue.create('Caixa Geral');

            // A sua regra executa o .trim() no outro termo se ele for string
            expect(vo.equals('   Caixa Geral   ')).toBe(true);
            expect(vo.equals('   caixa geral   ')).toBe(true);
        });

        it('deve retornar false ao comparar com instâncias ou strings que possuam valores semanticamente diferentes', () => {
            const name1 = AccountNameValue.create('Clientes Nacionais');
            const name2 = AccountNameValue.create('Clientes Estrangeiros');

            expect(name1.equals(name2)).toBe(false);
            expect(name1.equals('Clientes Estrangeiros')).toBe(false);
        });

        it('deve retornar false de forma segura se o outro termo comparado for nulo, indefinido ou um tipo totalmente inválido', () => {
            const name = AccountNameValue.create('Capital Social');

            expect(name.equals(null)).toBe(false);
            expect(name.equals(undefined)).toBe(false);

            // Força um tipo inválido (ex: number) para garantir que a linha typeof !== 'string' barra o fluxo com segurança
            expect(name.equals(12345 as any)).toBe(false);
            expect(name.equals({ name: 'Capital Social' } as any)).toBe(false);
        });
    });
});