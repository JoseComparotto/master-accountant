export class DomainException extends Error { // TODO: Especificar mais exceções de domínio
  constructor(message: string) {
    super(message);
    this.name = "DomainException";
  }
}