import { Inject } from "@nestjs/common";
import { IQuery } from "@nestjs/cqrs";
import type { IAccountQueryService } from "../interfaces/account-query-service.interface";
import { Ensure, UuidValue } from "@repo/shared-core";

export abstract class BaseAccountQuery implements IQuery {
    constructor(
        public readonly chartId: string,
    ) { }
}

export abstract class BaseAccountQueryHandler<Q extends BaseAccountQuery, R = any> {

    constructor(
        @Inject('IAccountQueryService')
        protected readonly service: IAccountQueryService
    ) { }

    abstract execute(query: Q): Promise<R>;

    protected getChartId(query: Q): UuidValue {
        return Ensure.vo('chartId', () => UuidValue.create(query.chartId));
    }
}

