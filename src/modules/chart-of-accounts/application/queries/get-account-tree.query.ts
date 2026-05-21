export class GetAllAccountsForChartQuery {
  constructor(
    public readonly chartId: string,
    public readonly targetDate?: Date,
  ) {}
}