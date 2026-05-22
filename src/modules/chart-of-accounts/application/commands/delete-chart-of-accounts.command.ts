import { ICommand } from "@nestjs/cqrs";

export class DeleteChartOfAccountsCommand implements ICommand {
    constructor(
        public readonly id: string,
    ) { }
}