export class GetAccountTreeQuery {
  constructor(
    public readonly chartId: string,
    public readonly targetDate: Date,
  ) {}
}