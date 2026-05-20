export class CreateChartOfAccountCommand {
    constructor(
        public readonly id: string | undefined,
        public readonly name: string,
        public readonly levelWidths: number[],
    ) { }
}