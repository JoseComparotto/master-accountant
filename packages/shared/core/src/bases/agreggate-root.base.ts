import { DomainEvent } from "../interfaces/domain-event.interface.js";

export abstract class AggregateRoot<TEvent extends DomainEvent = DomainEvent> {
  private _domainEvents: TEvent[] = [];

  get domainEvents(): TEvent[] {
    return [...this._domainEvents];
  }

  protected addDomainEvent(event: TEvent | undefined): void {
    if (event !== undefined) this._domainEvents.push(event);
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}