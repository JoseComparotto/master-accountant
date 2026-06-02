export class StructuralCodeValue {
    private segments: readonly number[];

    private constructor(segments: number[]) {
        // Value Objects devem ser imutáveis
        this.segments = Object.freeze([...segments]);
    }

    /**
     * Factory: Cria a partir de uma string (ex: "1.1.01")
     */
    static fromString(code: string): StructuralCodeValue {
        if (!code || !/^\d+(\.\d+)*$/.test(code)) {
            throw new Error(`Código estrutural inválido: ${code}`);
        }

        const segments = code.split('.').map(s => parseInt(s, 10));
        return new StructuralCodeValue(segments);
    }

    /**
     * Factory: Cria a partir de um array de números
     */
    static fromSegments(segments: number[]): StructuralCodeValue {
        return new StructuralCodeValue(segments);
    }

    /**
     * Gera o código para uma conta raiz baseado no localIndex
     */
    static createRoot(localIndex: number): StructuralCodeValue {
        return new StructuralCodeValue([localIndex]);
    }

    /**
     * Gera o código para uma conta filha baseado no localIndex
     */
    createChild(localIndex: number): StructuralCodeValue {
        return new StructuralCodeValue([...this.segments, localIndex]);
    }

    /**
     * Ordenação Hierárquica (CompareTo)
     * Essencial para o sort() do JavaScript funcionar corretamente com números.
     * Evita o erro de "1.10" vir antes de "1.2"
     */
    compare(other: StructuralCodeValue): number {
        const maxLen = Math.max(this.segments.length, other.segments.length);

        for (let i = 0; i < maxLen; i++) {
            const v1 = this.segments[i] ?? -1; // -1 garante que pai venha antes do filho
            const v2 = other.segments[i] ?? -1;

            if (v1 !== v2) return v1 - v2;
        }
        return 0;
    }

    /**
     * Parse automático para string
     */
    toString(): string {
        return this.segments.join('.');
    }

    get value(): string {
        return this.toString();
    }
}