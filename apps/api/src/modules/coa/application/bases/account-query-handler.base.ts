import { Inject } from "@nestjs/common";
import { IQuery } from "@nestjs/cqrs";
import type { IAccountQueryService } from "../interfaces/account-query-service.interface";
import { Ensure, UuidValue } from "@repo/shared-core";

export interface IAccountQuery extends IQuery {
}

export abstract class BaseAccountQueryHandler<Q extends IAccountQuery, R = any> {

    constructor(
        @Inject('IAccountQueryService')
        protected readonly service: IAccountQueryService
    ) { }

    abstract execute(query: Q): Promise<R>;
}

