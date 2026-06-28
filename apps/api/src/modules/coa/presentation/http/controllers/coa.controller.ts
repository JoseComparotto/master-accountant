import { Controller, Res } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { apiContract, ChartOfAccountsDto } from "@repo/coa-contracts";
import { tsRestHandler, TsRestHandler } from "@ts-rest/nest";
import { GetChartOfAccountsQuery } from "../../../application/queries/get-coa/get-coa.queryt";
import type { Response } from "express";
import { UpdateChartOfAccountsCommand, UpdateChartOfAccountsResult } from "../../../application/commands/update-coa/update-coa.command";
import { ApplyBatchActionsCommand } from "../../../application/commands/apply-coa-batch-actions/apply-coa-batch-actions.command";
import { CoaPatchTranslator } from "../services/coa-patch-translator.service";

@Controller()
export class ChartOfAccountsController {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly translator: CoaPatchTranslator,
    ) { }

    @TsRestHandler(apiContract.coa.get)
    async getCoa(
        @Res({ passthrough: true }) expressRes: Response
    ) {
        return tsRestHandler(apiContract.coa.get, async () => {
            const query = new GetChartOfAccountsQuery();
            const chart: ChartOfAccountsDto = await this.queryBus.execute(query);

            expressRes.setHeader('ETag', `"${chart.version}"`);
            return { status: 200, body: chart };
        });
    }

    @TsRestHandler(apiContract.coa.update)
    async updateCoa(
        @Res({ passthrough: true }) expressRes: Response
    ) {
        return tsRestHandler(apiContract.coa.update, async ({ body, headers }) => {
            const clientVersion = this.parseETag(headers['if-match']);

            const { match, chart }: UpdateChartOfAccountsResult = await this.commandBus.execute(
                new UpdateChartOfAccountsCommand(body, clientVersion)
            );

            expressRes.setHeader('ETag', `"${chart.version}"`);

            return {
                status: match ? 200 : 412,
                body: chart
            };
        });
    }

    @TsRestHandler(apiContract.coa.patch)
    async patchCoa(
        @Res({ passthrough: true }) expressRes: Response
    ) {
        return tsRestHandler(apiContract.coa.patch, async ({ body, headers }) => {

            const clientVersion = this.parseETag(headers['if-match']);

            const actions = this.translator.translateBatch(body);

            const { match, chart }: UpdateChartOfAccountsResult = await this.commandBus.execute(
                new ApplyBatchActionsCommand(actions, clientVersion)
            );

            expressRes.setHeader('ETag', `"${chart.version}"`);

            return {
                status: match ? 200 : 412,
                body: chart
            };
        });
    }

    private parseETag(ifMatchRaw: string): number {
        return parseInt(ifMatchRaw.replace(/^W\//i, '').replace(/"/g, ''), 10);
    }
}
