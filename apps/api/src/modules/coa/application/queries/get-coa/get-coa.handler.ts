import { QueryHandler } from "@nestjs/cqrs";
import { GetChartOfAccountsQuery, BaseGetChartOfAccountsQueryHandler } from "./get-coa.queryt";
import { ChartOfAccountsDto } from "../../../presentation/http/dtos/coa.dto";

@QueryHandler(GetChartOfAccountsQuery)
export class GetChartOfAccountsQueryHandler extends BaseGetChartOfAccountsQueryHandler {
    async execute(query: GetChartOfAccountsQuery): Promise<ChartOfAccountsDto> {
        return await this.service.getChart();
    }

}