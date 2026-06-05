import { ValueObjectMalformedException } from "../../../shared/exception/domain.exception.js";

export class AccountNameValue {
    private readonly _value: string;

    private constructor(value: string) {
        this._value = value;
    }

    /**
     * Factory: Higieniza e valida o nome da conta
     */
    public static create(rawValue: string): AccountNameValue {
        // 1. Sanitization: Corta espaços em branco antes de começar
        const sanitized = rawValue?.trim() ?? '';

        // 2. Validation: Aplica as regras de negócio
        if (sanitized.length === 0) {
            throw new ValueObjectMalformedException(
                'AccountName',
                rawValue,
                'O nome da conta não pode ser vazio.'
            );
        }

        if (sanitized.length < 3) {
            throw new ValueObjectMalformedException(
                'AccountName',
                rawValue,
                `O nome da conta é muito curto. Mínimo de 3 caracteres. Recebido: ${sanitized.length}`
            );
        }

        if (sanitized.length > 100) {
            throw new ValueObjectMalformedException(
                'AccountName',
                rawValue,
                `O nome da conta excede o limite de 100 caracteres. Recebido: ${sanitized.length}`
            );
        }

        // Se passou, retorna o valor perfeitamente higienizado
        return new AccountNameValue(sanitized);
    }

    /**
      * Factory Opcional: Se receber um valor nulo, vazio ou indefinido, 
      * retorna undefined de forma segura sem tentar validar.
      */
    public static createOptional(value: string | null | undefined): AccountNameValue | undefined {
        if (value === null || value === undefined || value.trim() === '') {
            return undefined;
        }

        // Se o valor existir, delega para a factory principal que possui a validação
        return AccountNameValue.create(value);
    }

    get value(): string {
        return this._value;
    }

    public equals(other?: AccountNameValue): boolean {
        if (!other) return false;
        return this.value.toUpperCase() === other.value.toUpperCase();
    }

    public toString(): string {
        return this.value;
    }
}