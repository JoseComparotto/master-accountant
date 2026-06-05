// packages/core/src/shared/domain/utils/value-object.helper.ts
import { ValueObjectMalformedException } from '../exception/domain.exception.js';

/**
 * Executa a fábrica de um Value Object de forma segura. 
 * Se falhar por má formatação, injeta o contexto do atributo alvo na exceção.
 */
export function wrapVO<T>(attributeName: string, factoryFn: () => T): T {
  try {
    return factoryFn();
  } catch (error) {
    if (error instanceof ValueObjectMalformedException) {
      throw error.withAttribute(attributeName);
    }
    throw error;
  }
}