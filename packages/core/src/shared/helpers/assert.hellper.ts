import { DomainException } from "../exception/domain.exception.js";

export class Assert {

    /// Expressão regular para validar UUID (sem versão específica)
    private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    /**
     * Valida tipos primitivos permitindo ou não nulos.
     */
    public static isType(
        value: any,
        expectedType: 'string' | 'boolean' | 'number',
        fieldName: string,
        isNullable = false
    ): void {
        // Se for null e permitido, ignora as outras validações
        if (value === null && isNullable) return;

        // Se for undefined (campo esquecido no mock/objeto), sempre estoura erro
        if (value === undefined) {
            throw new DomainException(`O campo '${fieldName}' deve ser definido (mesmo que nulo).`);
        }

        // Se for null mas não permitido
        if (value === null && !isNullable) {
            throw new DomainException(`O campo '${fieldName}' não pode ser nulo.`);
        }

        if (typeof value !== expectedType) {
            throw new DomainException(`O campo '${fieldName}' deve ser ${expectedType}. Recebido: ${typeof value}`);
        }
    }

    /**
     * Valida instâncias (Value Objects) permitindo ou não nulos.
     * Útil para campos como 'parentAccount' que podem ser null na raiz.
     */
    public static isInstanceOf(
        value: any,
        expectedClass: Function,
        fieldName: string,
        isNullable = false
    ): void {
        if (value === null && isNullable) return;

        if (value === null && !isNullable) {
            throw new DomainException(`O campo '${fieldName}' não pode ser nulo.`);
        }

        if (!(value instanceof expectedClass)) {
            throw new DomainException(`O campo '${fieldName}' deve ser uma instância de ${expectedClass.name}.`);
        }
    }

    /**
     * Valida se um valor pertence a um determinado Enum.
     */
    public static isEnum(
        value: any,
        enumObject: object,
        fieldName: string,
        isNullable = false
    ): void {
        if (value === null && isNullable) return;

        // Pega os valores válidos do Enum
        const validValues = Object.values(enumObject);

        if (!validValues.includes(value)) {
            throw new DomainException(
                `O campo '${fieldName}' possui um valor inválido. Valores aceitos: ${validValues.join(', ')}`
            );
        }
    }

    public static isUUID(value: string, fieldName: string): void {
        if (!this.UUID_REGEX.test(value)) {
            throw new DomainException(`O campo '${fieldName}' deve ser um UUID válido. Recebido: ${value}`);
        }
    }
}