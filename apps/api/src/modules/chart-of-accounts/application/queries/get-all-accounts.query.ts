import { IQuery } from "@nestjs/cqrs";

export class GetAllAccountsQuery implements IQuery {
    constructor(
        public readonly chartId: string
    ){}
}