import { AtributeConstraintViolationException, ValueObjectMalformedException } from "../exceptions/domain.exception.js";

export class Ensure {

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
            throw new AtributeConstraintViolationException(
                fieldName, `O campo '${fieldName}' deve ser definido (mesmo que nulo).`
            );
        }

        // Se for null mas não permitido
        if (value === null && !isNullable) {
            throw new AtributeConstraintViolationException(
                fieldName,
                `O campo '${fieldName}' não pode ser nulo.`
            );
        }

        if (typeof value !== expectedType) {
            throw new AtributeConstraintViolationException(
                fieldName,
                `O campo '${fieldName}' deve ser ${expectedType}. Recebido: ${typeof value}`
            );
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
            throw new AtributeConstraintViolationException(
                fieldName, `O campo '${fieldName}' não pode ser nulo.`
            );
        }

        if (!(value instanceof expectedClass)) {
            throw new AtributeConstraintViolationException(
                fieldName, `O campo '${fieldName}' deve ser uma instância de ${expectedClass.name}.`
            );
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
            throw new AtributeConstraintViolationException(
                fieldName,
                `O campo '${fieldName}' possui um valor inválido. Valores aceitos: ${validValues.join(', ')}`
            );
        }
    }

    /**
     * Captura falhas de Value Objects e as contextualiza com o nome do atributo da Entidade.
     * Excelente para responder à API exatamente qual campo do formulário falhou.
     */
    public static vo<T>(attributeName: string, factory: () => T): T{
        try {
            return factory();
        } catch (error) {
            if (error instanceof ValueObjectMalformedException) {
                error.withAttribute(attributeName);
            }
            throw error;
        }
    }
}