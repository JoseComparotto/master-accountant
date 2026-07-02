import { ValueObject, ValueObjectMalformedException } from "@repo/shared-core";

export class AccountNameValue extends ValueObject<string> {

    private static sanitize(rawValue: string) {
        return rawValue?.replace(/\s+/g, ' ')?.trim() ?? '';
    }

    /**
     * Factory: Higieniza e valida o nome da conta
     */
    public static create(rawValue: string): AccountNameValue {
        // 1. Sanitization: Corta espaços em branco antes de começar
        const sanitized = AccountNameValue.sanitize(rawValue);

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
                `Deve ter pelo menos 3 caracteres.`
            );
        }

        if (sanitized.length > 100) {
            throw new ValueObjectMalformedException(
                'AccountName',
                rawValue,
                `Deve ter no máximo 100 caracteres.`
            );
        }

        // Se passou, retorna o valor perfeitamente higienizado
        return new AccountNameValue(sanitized);
    }

    public override equals(other: string | AccountNameValue | null | undefined): boolean {

        if (other === null || other === undefined) return false;

        const otherIsAccountName = other instanceof AccountNameValue;

        if (typeof other !== 'string' && !otherIsAccountName) return false;

        const otherRaw = other instanceof AccountNameValue ?
            other._value : AccountNameValue.sanitize(other);

        return this._value.toLocaleLowerCase() === otherRaw.toLocaleLowerCase();
    }

    public static readonly createOptional = super.defineOptional(this.create);

}