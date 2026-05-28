import { ICommand } from "@nestjs/cqrs";

export class CreateAndPublishAccountCommand implements ICommand {
    constructor(
        public readonly id: string | null,
        public readonly chartId: string,
        public readonly parentId: string | null,
        public readonly nodeCode: number | null,
        public readonly name: string,
        public readonly description: string | null,
        public readonly accountClass: string | null,
        public readonly isContra: boolean,
        public readonly isAbstract: boolean,

        public readonly changesetId?: string,
        public readonly effectiveDate?: Date
    ) { }
}