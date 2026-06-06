import { ValueObject, ValueObjectOptionalFactoryFn } from "../../../shared/bases/value-object.base.js";
import { ValueObjectMalformedException } from "../../../shared/exception/domain.exception.js";

export class AccountNameValue extends ValueObject<string> {

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

    public override equals(other: string | AccountNameValue | null | undefined): boolean {

        if (other === null || other === undefined) return false;

        const otherIsAccountName = other instanceof AccountNameValue;

        if (typeof other !== 'string' && !otherIsAccountName) return false;

        const otherRaw = other instanceof AccountNameValue ? other._value : other.trim();

        return this._value.toLocaleLowerCase() === otherRaw.toLocaleLowerCase();
    }

    public static readonly createOptional = super.defineOptional(this.create);

}