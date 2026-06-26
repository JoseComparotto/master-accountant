import { ValueObject } from "../bases/value-object.base.js";
import { ValueObjectMalformedException } from "../exceptions/domain.exception.js";

export class UuidValue extends ValueObject<string> {

    /**
     * Static Factory: Cria ou reconstitui um UUID a partir de uma string existente (ex: vinda do banco ou da API)
     */
    public static create(value: string): UuidValue {
        UuidValue.validate(value);
        return new UuidValue(value.toLowerCase());
    }

    public static readonly createOptional = super.defineOptional(this.create);

    /**
     * Static Factory: Gera um novo UUIDv4 seguro de forma nativa
     */
    public static generate(): UuidValue {
        return new UuidValue(globalThis.crypto.randomUUID());
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
}