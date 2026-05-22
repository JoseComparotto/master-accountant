import { ICommand } from "@nestjs/cqrs";

export class CreateChartOfAccountsCommand implements ICommand {
    constructor(
        public readonly id: string | undefined,
        public readonly name: string,
        public readonly levelWidths: number[],
    ) { }
}