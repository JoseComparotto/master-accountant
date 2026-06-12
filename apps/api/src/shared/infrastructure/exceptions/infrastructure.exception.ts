export abstract class InfrastructureException extends Error {

    public readonly metadata: Record<string, any>;

    constructor(message: string, metadata: Record<string, any> = {}) {
        super(message);
        this.metadata = metadata;

        this.name = new.target.name;

        Object.setPrototypeOf(this, new.target.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, new.target);
        }
    }
}

export class OptimisticLockException extends InfrastructureException {
    constructor(entityId: string, expectedVersion: number, actualVersion: number) {
        super(
            `Conflito de concorrência detetado para o Plano de Contas "${entityId}". ` +
            `A versão enviada era ${expectedVersion}, mas a versão atual no banco é ${actualVersion}.`,
            {
                entityId, expectedVersion, actualVersion
            });
    }
}