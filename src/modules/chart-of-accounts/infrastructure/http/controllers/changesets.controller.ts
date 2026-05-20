import { Controller, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { CreateChangesetDto } from '../dtos/create-changeset.dto';
import { PublishChangesetDto } from '../dtos/publish-changeset.dto';

// Importe os comandos que você criará na camada de Application
import { CreateDraftChangesetCommand } from '../../../application/commands/create-draft-changeset.command';
import { PublishChangesetCommand } from '../../../application/commands/publish-changeset.command';

@Controller('changesets')
export class ChangesetsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async createDraft(@Body() dto: CreateChangesetDto) {
    // O Controller apenas roteia a intenção para o motor do CQRS
    return this.commandBus.execute(
      new CreateDraftChangesetCommand(
        dto.chartOfAccountsId,
        dto.incrementType,
        dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
      ),
    );
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK) // POST por padrão retorna 201, mas aqui 200 é mais semântico
  async publishChangeset(
    @Param('id') id: string,
    @Body() dto: PublishChangesetDto,
  ) {
    return this.commandBus.execute(
      new PublishChangesetCommand(
        id, 
        dto.effectiveDate ? new Date(dto.effectiveDate) : undefined
      ),
    );
  }
}