import { describe, test, expect, vi } from 'vitest';
import { Ensure } from './ensure.helper.js';
import { 
    AtributeConstraintViolationException, 
    ValueObjectMalformedException 
} from '../exception/domain.exception.js';

describe('Ensure Helper', () => {

    describe('isType - Validação de Tipos Primitivos', () => {
        // Teste parametrizado para os caminhos felizes (tipagem correta)
        test.each([
            { value: 'Master Accountant', type: 'string' as const,  field: 'name' },
            { value: 2026,                type: 'number' as const,  field: 'localIndex' },
            { value: true,                type: 'boolean' as const, field: 'isActive' },
        ])('deve passar sem erro quando o valor condiz com o tipo esperado ($type)', ({ value, type, field }) => {
            expect(() => Ensure.isType(value, type, field)).not.toThrow();
        });

        test('deve permitir valor nulo se a flag isNullable for true', () => {
            expect(() => Ensure.isType(null, 'string', 'description', true)).not.toThrow();
        });

        // Teste parametrizado blindando TODAS as invariantes de erro do método isType
        test.each([
            { value: undefined, type: 'string' as const,  isNullable: false, cenario: 'undefined (campo ausente)', expectedMsg: 'deve ser definido' },
            { value: undefined, type: 'string' as const,  isNullable: true,  cenario: 'undefined mesmo sendo anulável', expectedMsg: 'deve ser definido' },
            { value: null,      type: 'string' as const,  isNullable: false, cenario: 'null quando não permitido', expectedMsg: 'não pode ser nulo' },
            { value: 'texto',   type: 'number' as const,  isNullable: false, cenario: 'string enviada para number', expectedMsg: 'deve ser number. Recebido: string' },
            { value: 12345,     type: 'boolean' as const, isNullable: false, cenario: 'number enviado para boolean', expectedMsg: 'deve ser boolean. Recebido: number' },
        ])('deve lançar AtributeConstraintViolationException se o input for $cenario', ({ value, type, isNullable, expectedMsg }) => {
            
            expect(() => {
                Ensure.isType(value, type, 'campoTeste', isNullable);
            }).toThrow(AtributeConstraintViolationException);

            // Valida o conteúdo exato da mensagem de violação de atributo
            try {
                Ensure.isType(value, type, 'campoTeste', isNullable);
            } catch (error: any) {
                expect(error.message).toContain(expectedMsg);
                expect(error.message).toContain('campoTeste');
            }
        });
    });

    describe('isInstance - Validação de Instâncias de Objetos', () => {
        class MockValueObject {}
        class OutroValueObject {}

        test('deve passar com sucesso se o objeto for uma instância legítima da classe esperada', () => {
            const vo = new MockValueObject();
            expect(() => Ensure.isInstanceOf(vo, MockValueObject, 'parentAccount')).not.toThrow();
        });

        test('deve permitir valor nulo se isNullable for marcado como true', () => {
            expect(() => Ensure.isInstanceOf(null, MockValueObject, 'parentAccount', true)).not.toThrow();
        });

        // Teste parametrizado mapeando falhas de herança/instanciação
        test.each([
            { value: undefined,             isNullable: false, cenario: 'undefined', expectedMsg: 'deve ser definido' },
            { value: null,                  isNullable: false, cenario: 'null sem permissão', expectedMsg: 'não pode ser nulo' },
            { value: new OutroValueObject(), isNullable: false, cenario: 'instância de classe errada', expectedMsg: 'deve ser uma instância de MockValueObject' },
            { value: 'apenas_uma_string',   isNullable: false, cenario: 'tipo primitivo em vez de objeto', expectedMsg: 'deve ser uma instância de MockValueObject' },
        ])('deve lançar AtributeConstraintViolationException no cenário de $cenario', ({ value, isNullable, expectedMsg }) => {
            
            expect(() => {
                Ensure.isInstanceOf(value, MockValueObject, 'parentAccount', isNullable);
            }).toThrow(AtributeConstraintViolationException);
        });
    });

    describe('isEnum - Validação de Catálogos e Enums', () => {
        enum FakeAccountClass {
            ASSET = 'ASSET',
            LIABILITY = 'LIABILITY'
        }

        test('deve passar com sucesso se o valor primitivo constar na lista do Enum', () => {
            expect(() => Ensure.isEnum(FakeAccountClass.ASSET, FakeAccountClass, 'accountClass')).not.toThrow();
            expect(() => Ensure.isEnum('LIABILITY', FakeAccountClass, 'accountClass')).not.toThrow();
        });

        test('deve ignorar e passar se o valor for nulo e o campo aceitar nulos', () => {
            expect(() => Ensure.isEnum(null, FakeAccountClass, 'accountClass', true)).not.toThrow();
        });

        test.each([
            { value: 'REVENUE', isNullable: false, cenario: 'string fora do catálogo' },
            { value: 999,       isNullable: false, cenario: 'número arbitrário' },
            { value: null,      isNullable: false, cenario: 'null sem flag isNullable' },
        ])('deve lançar AtributeConstraintViolationException se receber $cenario', ({ value, isNullable }) => {
            
            expect(() => {
                Ensure.isEnum(value, FakeAccountClass, 'accountClass', isNullable);
            }).toThrow(AtributeConstraintViolationException);
        });
    });

    describe('vo - Intercepção e Contextualização de Erros de VOs', () => {
        test('deve executar e retornar o valor produzido pela factory se o fluxo for de sucesso', () => {
            const resultado = Ensure.vo('name', () => 'Driblado com Sucesso');
            
            expect(resultado).toBe('Driblado com Sucesso');
        });

        test('deve interceptar ValueObjectMalformedException, acionar o método de enriquecimento e repassar o erro', () => {
            // Instancia a exceção de malformação que simula a explosão interna de um VO
            const exception = new ValueObjectMalformedException('AccountName', ' ', 'Incorreto');
            
            // Cria um espião no método withAttribute da exceção
            const spywithAttribute = vi.spyOn(exception, 'withAttribute');

            expect(() => {
                Ensure.vo('nome_do_atributo_na_entidade', () => {
                    throw exception;
                });
            }).toThrow(ValueObjectMalformedException);

            // Garante que a "magia" de mapear o erro para a API aconteceu informando qual propriedade falhou
            expect(spywithAttribute).toHaveBeenCalledWith('nome_do_atributo_na_entidade');
        });

        test('deve deixar passar e não tocar em erros comuns (como erros genéricos do sistema)', () => {
            const erroComum = new Error('Falha catastrófica de infra');

            expect(() => {
                Ensure.vo('campoQualquer', () => {
                    throw erroComum;
                });
            }).toThrow(Error);
        });
    });
});