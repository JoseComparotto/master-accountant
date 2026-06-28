export abstract class DomainEvent {

    public readonly occurredOn: Date = new Date()
    
    constructor() {
    }
}