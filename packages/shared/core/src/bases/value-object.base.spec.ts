import { describe, it, expect } from 'vitest';
import { ValueObject } from './value-object.base.js';

// ============================================================================
// MOCKS & SUBCLASSES CONCRETAS PARA FINS DE TESTE
// ============================================================================

class TestStringVO extends ValueObject<string> {
    public static create(value: string): TestStringVO {
        return new TestStringVO(value);
    }
    
    // Testa a assinatura gerada pelo helper defineOptional da base
    public static readonly createOptional = TestStringVO.defineOptional(TestStringVO.create);
}

class TestNumberVO extends ValueObject<number> {
    public static create(value: number): TestNumberVO {
        return new TestNumberVO(value);
    }
}

interface ComplexProps {
    code: string;
    tags: string[];
}

class TestComplexVO extends ValueObject<ComplexProps> {
    public static create(props: ComplexProps): TestComplexVO {
        return new TestComplexVO(props);
    }
}

// Subclasse secundária com mesmo tipo primitivo para testar isolamento de tipo/contexto
class AnotherStringVO extends ValueObject<string> {
    public static create(value: string): AnotherStringVO {
        return new AnotherStringVO(value);
    }
}

// ============================================================================
// SUITE DE TESTES UNITÁRIOS
// ============================================================================

describe('ValueObject (Base)', () => {
    
    describe('Instanciação e Imutabilidade', () => {
        it('deve reter e expor o valor primitivo fornecido perfeitamente', () => {
            const vo = TestStringVO.create('master-accountant-token');
            expect(vo.value).toBe('master-accountant-token');
        });

        it('deve congelar estruturalmente objetos complexos para garantir imutabilidade profunda no Domínio', () => {
            const props: ComplexProps = { code: '1.1.01', tags: ['contabilidade', 'ifrs'] };
            const vo = TestComplexVO.create(props);

            // No strict mode do ESM/TypeScript, tentar mutar o valor interno deve lançar um erro
            expect(() => {
                (vo.value as any).code = '2.1.01';
            }).toThrow();

            // Tentar adicionar elementos ao array interno congelado também deve quebrar
            expect(() => {
                (vo.value as any).tags.push('xbrl');
            }).toThrow();
        });

        it('deve clonar e isolar referências de arrays para que mutações no array original externo não afetem o VO', () => {
            const originalTags = ['ativo', 'passivo'];
            const props: ComplexProps = { code: '1.0', tags: originalTags };
            const vo = TestComplexVO.create(props);

            // Modifica a referência do array original externo após o nascimento do VO
            originalTags.push('receita-mutada-externamente');

            // O estado interno do Value Object deve permanecer imutável e intacto
            expect(vo.value.tags).toEqual(['ativo', 'passivo']);
            expect(vo.value.tags).not.toContain('receita-mutada-externamente');
        });
    });

    describe('Comparação por Valor (equals)', () => {
        it('deve retornar true para duas instâncias distintas com o mesmo valor primitivo idêntico', () => {
            const vo1 = TestStringVO.create('summary-account');
            const vo2 = TestStringVO.create('summary-account');

            expect(vo1.equals(vo2)).toBe(true);
        });

        it('deve retornar false para instâncias com valores primitivos distintos', () => {
            const vo1 = TestStringVO.create('posting-account');
            const vo2 = TestStringVO.create('summary-account');

            expect(vo1.equals(vo2)).toBe(false);
        });

        it('deve retornar true para duas instâncias com objetos complexos estruturalmente idênticos (Deep Equal)', () => {
            const vo1 = TestComplexVO.create({ code: '1.1', tags: ['asset'] });
            const vo2 = TestComplexVO.create({ code: '1.1', tags: ['asset'] });

            expect(vo1.equals(vo2)).toBe(true);
        });

        it('deve retornar false se qualquer propriedade de um objeto complexo interno diferir', () => {
            const vo1 = TestComplexVO.create({ code: '1.1', tags: ['asset'] });
            const vo2 = TestComplexVO.create({ code: '1.1', tags: ['liability'] });

            expect(vo1.equals(vo2)).toBe(false);
        });

        it('deve retornar false de forma segura ao comparar com null ou undefined', () => {
            const vo = TestStringVO.create('valid-value');

            expect(vo.equals(null)).toBe(false);
            expect(vo.equals(undefined)).toBe(false);
        });

        it('deve barrar a igualdade se as classes/construtores forem diferentes, mesmo se o valor interno for idêntico (Proteção de Tipo Siga-o-Contexto)', () => {
            const stringVo = TestStringVO.create('mesma-string-bruta');
            const anotherVo = AnotherStringVO.create('mesma-string-bruta');

            // Mesmo contendo a mesma string, a semântica de tipos de classes filhas deve impedir a igualdade
            expect(stringVo.equals(anotherVo)).toBe(false);
        });
    });

    describe('Conversão Textual (toString)', () => {
        it('deve retornar a representação em string direta de tipos primitivos', () => {
            const stringVo = TestStringVO.create('fluxo-caixa');
            const numberVo = TestNumberVO.create(450.75);

            expect(stringVo.toString()).toBe('fluxo-caixa');
            expect(numberVo.toString()).toBe('450.75');
        });

        it('deve retornar a serialização em JSON string estruturada para objetos complexos', () => {
            const props = { code: 'ABC', tags: ['tag-auditoria'] };
            const vo = TestComplexVO.create(props);

            expect(vo.toString()).toBe(JSON.stringify(props));
        });
    });

    describe('Fábrica Opcional (defineOptional)', () => {
        it('deve realizar curto-circuito e retornar undefined imediatamente ao receber null ou undefined', () => {
            expect(TestStringVO.createOptional(null)).toBeUndefined();
            expect(TestStringVO.createOptional(undefined)).toBeUndefined();
        });

        it('deve invocar a fábrica interna e retornar a instância concreta do VO se receber um payload válido', () => {
            const result = TestStringVO.createOptional('payload-valido');

            expect(result).toBeInstanceOf(TestStringVO);
            expect(result?.value).toBe('payload-valido');
        });
    });
});