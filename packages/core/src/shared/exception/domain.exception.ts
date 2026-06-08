import { UuidValue } from "../value-objects/uuid.value.js";

export abstract class DomainException extends Error {

  // Metadados genéricos opcionais para enriquecer o payload da API externa
  public readonly metadata: Record<string, any>;

  constructor(message: string, metadata: Record<string, any> = {}) {
    super(message);
    this.metadata = metadata;

    // Garante que o nome da classe física (ex: EntityNotExistsException) seja mantido
    this.name = new.target.name;

    // Corrige a cadeia de protótipos para heranças do tipo Error em TS/JS
    Object.setPrototypeOf(this, new.target.prototype);

    // Captura a stack trace corretamente isolando o construtor da própria exceção
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }
}

export class EntityAlreadyExistsException extends DomainException {
  constructor(
    public readonly entityName: string,
    public readonly identifier: UuidValue
  ) {
    super(
      `${entityName} with ID ${identifier} already exists.`,
      { entityName, identifier } // Metadados expostos para a Infraestrutura/API
    );
  }
}

export class EntityNotExistsException extends DomainException {
  constructor(
    public readonly entityName: string,
    public readonly identifier: UuidValue
  ) {
    super(
      `${entityName} with ID ${identifier} not found.`,
      { entityName, identifier }
    );
  }
}

export class BusinessRuleViolationException extends DomainException {
  constructor(message: string, metadata: Record<string, any> = {}) {
    super(message, metadata);
  }
}

export class DomainInvariantViolationException extends BusinessRuleViolationException {
  constructor(
    public readonly ruleId: string,
    message: string,
    entityName?: string,
  ) {
    super(message, { ruleId, entityName });
  }
}

export class AtributeConstraintViolationException extends BusinessRuleViolationException {
  constructor(
    public readonly attribute: string,
    message: string
  ) {
    super(message, { attribute });
  }
}

export class AttributeImmutableViolationException extends AtributeConstraintViolationException {
  constructor(attribute: string) {
    super(attribute, `O campo ${attribute} é imutável.`)
  }
}

export class ValueObjectMalformedException extends BusinessRuleViolationException {
  constructor(
    public readonly valueObjectName: string,
    public readonly value: any,
    message: string,
    metadata: Record<string, any> = {}
  ) {
    // Inicializa a exceção de negócio com os metadados brutos do VO
    super(message, { valueObjectName, value, ...metadata });
  }

  /**
   * Padrão Fluente: Permite contextualizar a exceção adicionando o nome 
   * do atributo onde este Value Object foi atribuído.
   */
  public withAttribute(attributeName: string): this {
    this.metadata.attributeName = attributeName;
    return this;
  }
}
