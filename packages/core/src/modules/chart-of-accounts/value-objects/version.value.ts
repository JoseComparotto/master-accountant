import { ValueObject, ValueObjectMalformedException } from "../../../shared/index.js";

export class VersionValue extends ValueObject<number> {

    public static create(value: number): VersionValue {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 0)
            throw new ValueObjectMalformedException(
                'VersionValue', value,
                `Version must be a non-negative integer. Received: ${value}`
            );
        return new VersionValue(value);
    }

    public static initial(): VersionValue {
        return this.create(0);
    }

    public next(): VersionValue {
        return VersionValue.create(this.value + 1);
    }

    public previous(): VersionValue {
        return VersionValue.create(this.value - 1);
    }
}