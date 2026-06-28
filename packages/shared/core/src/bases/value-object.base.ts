export type ValueObjectFactoryFn<P, V extends ValueObject<P>> = (p: P) => V;
export type ValueObjectOptionalFactoryFn<P, V extends ValueObject<P>> = (p: P | null | undefined) => V | undefined;

export abstract class ValueObject<T, U = T> {
    // O estado interno é protegido e imutável
    protected readonly _value: T;

    protected constructor(value: T) {
        if (typeof value === 'object' && value !== null) {
            // 1. Isola totalmente de mutações externas através do Deep Clone nativo
            const deepCloned = structuredClone(value);

            // 2. Bloqueia alterações internas aninhadas aplicando o Deep Freeze recursivo
            this._value = ValueObject.deepFreeze(deepCloned);
        } else {
            this._value = value;
        }
    }

    /**
     * Utilitário recursivo privado para congelar objetos e arrays profundamente.
     * Impede qualquer tentativa de alteração em estruturas aninhadas sob Strict Mode.
     */
    private static deepFreeze<T extends { [k: (string | symbol)]: any } | null>(obj: T): Readonly<T> {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        // Recupera todas as propriedades da instância (incluindo chaves do tipo Symbol)
        const propNames = Reflect.ownKeys(obj);

        for (const name of propNames) {
            const value = obj[name];
            // Se a subpropriedade for um objeto ou array, mergulha recursivamente
            if (typeof value === 'object' && value !== null) {
                ValueObject.deepFreeze(value);
            }
        }

        // Congela o nível atual do nó da árvore estrutural
        return Object.freeze(obj);
    }

    /**
     * Retorna a representação primitiva ou estrutural interna.
     * Pode ser sobrescrita caso o contrato público divirja do armazenamento interno.
     */
    public get value(): T | U {
        return this._value;
    }

    /**
     * Comparação estrutural profunda por valor (Pilar fundamental de um Value Object).
     */
    public equals(other: typeof this | T | null | undefined): boolean {
        if (other === null || other === undefined) return false;

        // Se for outra instância de Value Object, garante a integridade de classes idênticas
        if (other instanceof ValueObject && other.constructor !== this.constructor) {
            return false;
        }

        // Desembrulha o valor se for um Value Object, senão usa o próprio primitivo passado
        const otherRawValue = other instanceof ValueObject ? other._value : other;

        return ValueObject.isDeepEqual(this._value, otherRawValue);
    }

    /**
     * Helper recursivo de alta performance para validação estrutural.
     * Mantém o pacote livre de dependências externas como lodash.
     */
    private static isDeepEqual(a: any, b: any): boolean {
        // 1. Curto-circuito para igualdade de referência ou tipos primitivos idênticos
        if (a === b) return true;

        // 2. Se algum deles não for objeto ou for nulo, eles não são estruturalmente iguais
        if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
            return false;
        }

        // 3. Extração e comparação do tamanho das chaves do objeto
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return false;

        // 4. Verificação recursiva de cada chave (ignora totalmente a ordem de inserção física das propriedades)
        for (const key of keysA) {
            if (!keysB.includes(key) || !this.isDeepEqual(a[key], b[key])) {
                return false;
            }
        }

        return true;
    }

    public static isEquals<P, V extends ValueObject<P>>(
        v1: V | P | null | undefined,
        v2: V | P | null | undefined
    ): boolean {
        // Curto-circuito: Referências idênticas na memória ou ambos null/undefined
        if (v1 === v2) return true;

        // Se um deles for nulo ou indefinido (e o teste acima falhou), não são iguais
        if (v1 === null || v1 === undefined || v2 === null || v2 === undefined) {
            return false;
        }

        // Type Guard: Se v1 for uma instância de ValueObject, delega para o equals dele.
        // Isso garante que regras customizadas de subclasses (como letras maiúsculas no AccountName) funcionem!
        if (v1 instanceof ValueObject) {
            return v1.equals(v2);
        }

        if (v2 instanceof ValueObject) {
            return v2.equals(v1);
        }

        // Se ambos caírem aqui, significa que ambos são tipos estruturais/primitivos brutos (P)
        return ValueObject.isDeepEqual(v1, v2);
    }

    /**
     * Conversão implícita ou explícita para string.
     */
    public toString(): string {
        const value = this.value;
        if (typeof value === 'string') return value;
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    }

    /**
     * Gerador de Fábricas Opcionais (HOF).
     * Centraliza a lógica de curto-circuito para valores nulos ou indefinidos.
     */
    protected static defineOptional<P, V extends ValueObject<P>>(
        factory: ValueObjectFactoryFn<P, V>
    ): ValueObjectOptionalFactoryFn<P, V> {
        return (p: P | null | undefined) => {
            if (p === null || p === undefined) return undefined;
            return factory(p);
        };
    }
}

