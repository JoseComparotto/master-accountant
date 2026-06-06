import { ValueObject } from "../../../shared/bases/value-object.base.js";
import { ValueObjectMalformedException } from "../../../shared/exception/domain.exception.js";

export class StructuralCodeValue extends ValueObject<number[]>  {

    private constructor(segments: number[]) {
        StructuralCodeValue.validate(segments);
        super(segments);
    }

    /**
     * Retorna a representação primitiva em string unida por pontos (ex: "1.1.2")
     */
    public override get value(): string {
        return this._value.join('.');
    }

    /**
     * Retorna uma cópia dos segmentos numéricos protegendo a imutabilidade interna
     */
    public get segments(): number[] {
        return [...this._value];
    }

    /**
     * Regra de Invariante Absoluta: Auto-validação do Value Object
     */
    private static validate(segments: number[]): void {
        // 1. Garante que tenha no mínimo 1 segmento
        if (!segments || segments.length < 1) {
            throw new ValueObjectMalformedException(
                'StructuralCode',
                segments,
                'O código estrutural deve conter no mínimo 1 segmento.'
            );
        }

        // 2. Garante que todos os segmentos sejam inteiros e positivos (> 0)
        for (const segment of segments) {
            if (!Number.isInteger(segment) || segment <= 0) {
                throw new ValueObjectMalformedException(
                    'StructuralCode',
                    segments,
                    `Cada segmento do código estrutural deve ser um número inteiro e positivo. Recebido: "${segment}"`
                );
            }
        }
    }

    /**
     * Factory: Cria a partir de uma string (ex: "1.1.01")
     */
    public static fromString(code: string): StructuralCodeValue {
        // Validação sintática inicial via regex antes do parse
        if (!code || !/^\d+(\.\d+)*$/.test(code)) {
            throw new ValueObjectMalformedException(
                'StructuralCode',
                code,
                `O formato do código estrutural fornecido é inválido: "${code}"`
            );
        }

        const segments = code.split('.').map(s => parseInt(s, 10));
        return new StructuralCodeValue(segments);
    }

    /**
     * Factory: Cria a partir de um array de números
     */
    public static fromSegments(segments: number[]): StructuralCodeValue {
        return new StructuralCodeValue(segments);
    }

    /**
     * Gera o código para uma conta raiz baseado no localIndex
     */
    public static createRoot(localIndex: number): StructuralCodeValue {
        return new StructuralCodeValue([localIndex]);
    }

    /**
     * Gera o código para uma conta filha baseado no localIndex
     */
    public createChild(localIndex: number): StructuralCodeValue {
        return new StructuralCodeValue([...this.segments, localIndex]);
    }

    /**
     * Ordenação Hierárquica (CompareTo)
     * Essencial para ordenações estruturais no ecossistema e queries
     */
    public compareTo(other: StructuralCodeValue): number {
        const maxLen = Math.max(this.segments.length, other.segments.length);

        for (let i = 0; i < maxLen; i++) {
            const v1 = this.segments[i] ?? -1; // -1 garante precedência do nó pai
            const v2 = other.segments[i] ?? -1;

            if (v1 !== v2) return v1 - v2;
        }
        return 0;
    }
}