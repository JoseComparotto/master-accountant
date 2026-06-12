import { IQuery } from "@nestjs/cqrs";

export class GetAccountByIdQuery implements IQuery {
    constructor(
        public readonly chartId: string,
        public readonly accountId: string,
    ) {}
}