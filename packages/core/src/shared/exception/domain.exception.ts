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
    public readonly identifier: string
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
    public readonly identifier: string | number
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