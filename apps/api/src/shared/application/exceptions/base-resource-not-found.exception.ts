// TODO: Configurar Exception Filter
export abstract class BaseResourceNotFoundException extends Error {
    constructor(resourceName: string, resourceId: string) {
        super(`${resourceName} with ID ${resourceId} not found.`);
        this.name = 'BaseResourceNotFoundException';
    }
}