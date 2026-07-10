import { Controller, Get, Put, Patch, Body, Headers, Res, HttpStatus } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import type { Response } from "express";

import { GetChartOfAccountsQuery } from "../../../application/queries/get-coa/get-coa.queryt";
import { UpdateChartOfAccountsCommand, UpdateChartOfAccountsResult } from "../../../application/commands/update-coa/update-coa.command";
import { ApplyBatchActionsCommand } from "../../../application/commands/apply-coa-batch-actions/apply-coa-batch-actions.command";
import { CoaPatchTranslator } from "../services/coa-patch-translator.service";

import { ChartOfAccountsDto, UpdateChartOfAccountsInputDto } from "../dtos/coa.dto";
import { CoaPatchOperation } from "../dtos/coa-patch-operation.dto";
import { ApiBody, getSchemaPath } from "@nestjs/swagger";

@Controller('coa')
export class ChartOfAccountsController {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly translator: CoaPatchTranslator,
    ) { }

    @Get()
    async getCoa(@Res({ passthrough: true }) expressRes: Response): Promise<ChartOfAccountsDto> {
        const query = new GetChartOfAccountsQuery();
        const chart: ChartOfAccountsDto = await this.queryBus.execute(query);

        expressRes.setHeader('ETag', `"${chart.version}"`);
        return chart;
    }

    @Put()
    async updateCoa(
        @Headers('if-match') ifMatch: string,
        @Body() body: UpdateChartOfAccountsInputDto,
        @Res({ passthrough: true }) expressRes: Response
    ): Promise<ChartOfAccountsDto> {
        const clientVersion = this.parseETag(ifMatch || '');

        const { match, chart }: UpdateChartOfAccountsResult = await this.commandBus.execute(
            new UpdateChartOfAccountsCommand(body, clientVersion)
        );

        expressRes.setHeader('ETag', `"${chart.version}"`);

        if (!match) {
            expressRes.status(HttpStatus.PRECONDITION_FAILED); // Status 412
        } else {
            expressRes.status(HttpStatus.OK);
        }

        return chart;
    }

    @Patch()
    @ApiBody({
        type: [CoaPatchOperation]
    })
    async patchCoa(
        @Headers('if-match') ifMatch: string,
        @Body() body: CoaPatchOperation[],
        @Res({ passthrough: true }) expressRes: Response
    ): Promise<ChartOfAccountsDto> {
        const clientVersion = this.parseETag(ifMatch || '');

        const actions = this.translator.translateBatch(body);

        const { match, chart }: UpdateChartOfAccountsResult = await this.commandBus.execute(
            new ApplyBatchActionsCommand(actions, clientVersion)
        );

        expressRes.setHeader('ETag', `"${chart.version}"`);

        if (!match) {
            expressRes.status(HttpStatus.PRECONDITION_FAILED); // Status 412
        } else {
            expressRes.status(HttpStatus.OK);
        }

        return chart;
    }

    private parseETag(ifMatchRaw: string): number {
        return parseInt(ifMatchRaw.replace(/^W\//i, '').replace(/"/g, ''), 10);
    }
}