import { describe, it, expect } from 'vitest';
import { StructuralCodeValue } from './structural-code.value.js';
import { ValueObjectMalformedException } from '@repo/shared-core';

describe('StructuralCodeValue', () => {

    describe('Criação com Sucesso e Fábricas (Factories)', () => {
        it('deve criar uma conta raiz válida usando createRoot', () => {
            const vo = StructuralCodeValue.createRoot(1);

            expect(vo.value).toBe('1');
            expect(vo.segments).toEqual([1]);
        });

        it('deve criar uma instância a partir de um array numérico bruto usando fromSegments', () => {
            const vo = StructuralCodeValue.fromSegments([1, 1, 2]);

            expect(vo.value).toBe('1.1.2');
            expect(vo.segments).toEqual([1, 1, 2]);
        });

        it('deve fazer o parse correto de uma string contábil válida usando fromString', () => {
            const vo = StructuralCodeValue.fromString('1.1.03');

            // Note que "03" é convertido para o inteiro 3 pelo parseInt interno
            expect(vo.value).toBe('1.1.3');
            expect(vo.segments).toEqual([1, 1, 3]);
        });

        it('deve gerar uma instância filha correta a partir de um nó pai usando createChild', () => {
            const pai = StructuralCodeValue.fromSegments([1, 1]);
            const filho = pai.createChild(5);

            expect(filho.value).toBe('1.1.5');
            expect(filho.segments).toEqual([1, 1, 5]);
            // Garante que o pai permaneceu imutável
            expect(pai.value).toBe('1.1');
        });

        // --- NOVOS TESTES: Fábrica Flexível (create) ---
        it('deve aceitar uma string na fábrica flexível "create" e delegar para fromString', () => {
            const vo = StructuralCodeValue.create('2.3.4');

            expect(vo.value).toBe('2.3.4');
            expect(vo.segments).toEqual([2, 3, 4]);
        });

        it('deve aceitar um array de números na fábrica flexível "create" e delegar para fromSegments', () => {
            const vo = StructuralCodeValue.create([2, 3, 4]);

            expect(vo.value).toBe('2.3.4');
            expect(vo.segments).toEqual([2, 3, 4]);
        });
    });


    describe('Getters de Análise Estrutural (level e localIndex)', () => {
        it('deve retornar o nível (level) correto baseado na profundidade da árvore', () => {
            const raiz = StructuralCodeValue.createRoot(1);            // [1]
            const nivelTres = StructuralCodeValue.fromString('1.4.2'); // [1, 4, 2]
            const nivelCinco = StructuralCodeValue.create([1, 2, 3, 4, 5]);

            expect(raiz.level).toBe(1);
            expect(nivelTres.level).toBe(3);
            expect(nivelCinco.level).toBe(5);
        });

        it('deve retornar o índice local (localIndex) extraído do último segmento do código', () => {
            const raiz = StructuralCodeValue.createRoot(4);            // Último é 4
            const contaFilha = StructuralCodeValue.fromString('1.1.9'); // Último é 9
            const contaLonga = StructuralCodeValue.create([2, 5, 1, 42]); // Último é 42

            expect(raiz.localIndex).toBe(4);
            expect(contaFilha.localIndex).toBe(9);
            expect(contaLonga.localIndex).toBe(42);
        });
    });

    describe('Invariantes de Domínio (Testes Parametrizados de Segmentos)', () => {
        it.each([
            { input: [], cenario: 'um array vazio' },
            { input: null as any, cenario: 'nulo' },
        ])('deve lançar ValueObjectMalformedException se receber $cenario', ({ input }) => {
            expect(() => {
                StructuralCodeValue.fromSegments(input);
            }).toThrow(ValueObjectMalformedException);
        });

        it.each([
            { input: [1, -2, 3], cenario: 'número negativo' },
            { input: [1, 0, 2], cenario: 'zero' },
            { input: [1, 1.5, 3], cenario: 'número decimal' },
        ])('deve lançar ValueObjectMalformedException se algum segmento for $cenario', ({ input }) => {
            expect(() => {
                StructuralCodeValue.fromSegments(input);
            }).toThrow(ValueObjectMalformedException);
        });
    });

    describe('Validação de Strings Incorretas (fromString)', () => {
        it.each([
            { input: '', cenario: 'vazia' },
            { input: '   ', cenario: 'apenas espaços' },
            { input: '1..2', cenario: 'pontos duplicados sem segmento' },
            { input: '1.a.3', cenario: 'caracteres alfabéticos' },
            { input: '1.2.', cenario: 'ponto órfão no final' },
            { input: 'abc', cenario: 'texto arbitrário' }
        ])('deve lançar ValueObjectMalformedException se a string for $cenario', ({ input }) => {
            expect(() => {
                StructuralCodeValue.fromString(input);
            }).toThrow(ValueObjectMalformedException);
        });
    });

    describe('Imutabilidade e Encapsulamento', () => {
        it('deve blindar o estado e impedir mutação acidental por referências externas de arrays', () => {
            const arrayBruto = [1, 1, 2];
            const vo = StructuralCodeValue.fromSegments(arrayBruto);

            // Tenta alterar o array de fora
            arrayBruto[2] = 99;
            expect(vo.value).toBe('1.1.2'); // Permaneceu protegido

            // Tenta alterar capturando o getter
            const deDentro = vo.segments;
            deDentro[0] = 99;
            expect(vo.value).toBe('1.1.2'); // Permaneceu protegido pelo clone defensivo [...this._value]
        });

        it('deve converter implicitamente para string usando o método toString', () => {
            const vo = StructuralCodeValue.fromSegments([1, 2, 3]);
            expect(vo.toString()).toBe('1.2.3');
        });
    });

    describe('Comparação por Valor (equals)', () => {
        it('deve retornar true para instâncias com códigos idênticos', () => {
            const code1 = StructuralCodeValue.fromString('1.1.2');
            const code2 = StructuralCodeValue.fromSegments([1, 1, 2]);

            expect(code1.equals(code2)).toBe(true);
        });

        it('deve retornar false para códigos estruturais diferentes ou nulos', () => {
            const code1 = StructuralCodeValue.fromString('1.1.2');
            const code2 = StructuralCodeValue.fromString('1.1.3');

            expect(code1.equals(code2)).toBe(false);
            expect(code1.equals(undefined)).toBe(false);
        });
    });

    describe('Ordenação Hierárquica Contábil (compareTo)', () => {
        it('deve retornar 0 se as duas estruturas forem idênticas', () => {
            const code1 = StructuralCodeValue.fromString('1.1.2');
            const code2 = StructuralCodeValue.fromString('1.1.2');

            expect(code1.compareTo(code2)).toBe(0);
        });

        it('deve ordenar irmãos corretamente com base no seu índice ordinal', () => {
            const menor = StructuralCodeValue.fromString('1.1.1');
            const maior = StructuralCodeValue.fromString('1.1.2');

            expect(menor.compareTo(maior)).toBeLessThan(0);  // 1.1.1 vem antes de 1.1.2
            expect(maior.compareTo(menor)).toBeGreaterThan(0);
        });

        it('deve garantir que o Pai tenha precedência absoluta sobre o Filho (Regra do -1)', () => {
            const pai = StructuralCodeValue.fromString('1.1');
            const filho = StructuralCodeValue.fromString('1.1.1');

            // O pai é menor (vem antes na árvore estrutural) porque o seu 3º segmento é "ausente" (-1)
            expect(pai.compareTo(filho)).toBeLessThan(0);   // 1.1 vem ANTES de 1.1.1
            expect(filho.compareTo(pai)).toBeGreaterThan(0); // 1.1.1 vem DEPOIS de 1.1
        });

        it('deve ordenar corretamente em ramos totalmente diferentes de profundidades variadas', () => {
            const ramoA = StructuralCodeValue.fromString('1.1.5');
            const ramoB = StructuralCodeValue.fromString('1.2');

            // 1.1.5 vem antes de 1.2 porque na segunda posição (irmãos de nível 2), 1 < 2
            expect(ramoA.compareTo(ramoB)).toBeLessThan(0);
            expect(ramoB.compareTo(ramoA)).toBeGreaterThan(0);
        });
    });
});