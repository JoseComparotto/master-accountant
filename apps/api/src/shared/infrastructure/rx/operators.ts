import { OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Operador RxJS que lança um erro se o valor for null ou undefined.
 * Também remove o 'null' e 'undefined' da tipagem do TypeScript downstream.
 */
export function throwIfNull<T>(
  errorFactory: () => any = () => new Error('Value cannot be null or undefined')
): OperatorFunction<T, NonNullable<T>> {
  return map(value => {
    if (value === null || value === undefined) {
      throw errorFactory();
    }
    return value as NonNullable<T>;
  });
}