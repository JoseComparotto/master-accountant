import { ValueObjectMalformedException } from "../exception/domain.exception.js";

export class UuidValue {
    private readonly _value: string;

    // Construtor privado impede que o objeto seja instanciado arbitrariamente de forma inválida externamente
    private constructor(value: string) {
        this._value = value;
    }

    /**
     * Static Factory: Cria ou reconstitui um UUID a partir de uma string existente (ex: vinda do banco ou da API)
     */
    public static create(value: string): UuidValue {
        this.validate(value);
        return new UuidValue(value.toLowerCase());
    }

    /**
   * Factory Opcional: Se receber um valor nulo, vazio ou indefinido, 
   * retorna undefined de forma segura sem tentar validar.
   */
    public static createOptional(value: string | null | undefined): UuidValue | undefined {
        if (value === null || value === undefined || value.trim() === '') {
            return undefined;
        }

        // Se o valor existir, delega para a factory principal que possui a validação
        return UuidValue.create(value);
    }

    /**
     * Static Factory: Gera um novo UUIDv4 seguro de forma nativa
     */
    public static generate(): UuidValue {
        return new UuidValue(globalThis.crypto.randomUUID());
    }

    /**
     * Retorna o valor primitivo
     */
    get value(): string {
        return this._value;
    }

    /**
     * Garante a comparação por valor, típica de um Value Object
     */
    public equals(other?: UuidValue): boolean {
        if (!other) return false;
        return this._value === other.value;
    }

    /**
     * Permite a conversão implícita ou explícita para string em interpolações
     */
    public toString(): string {
        return this._value;
    }

    /**
     * Regra de Invariante: O Value Object auto-valida-se na sua criação
     */
    private static validate(value: string): void {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if (!value || !uuidRegex.test(value)) {
            // Lança uma exceção pura de domínio, capturada posteriormente pelos seus Exception Filters na API
            throw new ValueObjectMalformedException(
                'Uuid',
                value,
                `O formato do valor "${value}" é inválido para um UUID.`
            );
        }
    }

    /**
   * Compara a igualdade de duas instâncias de UuidValue.
   * Suporta instâncias puras, strings, valores nulos ou indefinidos.
   */
    public static equals(id1: UuidValue | string | null | undefined, id2: UuidValue | string | null | undefined): boolean {
        // 1. Curto-circuito: Se forem idênticos em referência ou ambos forem null/undefined
        if (id1 === id2) {
            return true;
        }

        // 2. Se um deles for nulo/falsy (e o teste acima falhou), eles não são iguais
        if (!id1 || !id2) {
            return false;
        }

        // 3. Normaliza ambos para string pura para fazer a comparação final por valor
        const str1 = id1 instanceof UuidValue ? id1.value : id1.toLowerCase();
        const str2 = id2 instanceof UuidValue ? id2.value : id2.toLowerCase();

        return str1 === str2;
    }
}