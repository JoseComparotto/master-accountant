import { Controller, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { CreateChangesetDto } from '@modules/chart-of-accounts/infrastructure/http/dtos/create-changeset.dto';
import { PublishChangesetDto } from '@modules/chart-of-accounts/infrastructure/http/dtos/publish-changeset.dto';

// Importe os comandos que você criará na camada de Application
import { CreateDraftChangesetCommand } from '@modules/chart-of-accounts/application/commands/create-draft-changeset.command';
import { PublishChangesetCommand } from '@modules/chart-of-accounts/application/commands/publish-changeset.command';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SWAGGER_TAGS } from '@shared/constants/swagger.constants';

@ApiTags(SWAGGER_TAGS.CHART_OF_ACCOUNTS.name)
@Controller('changesets')
export class ChangesetsController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    operationId: 'createDraftChangeset',
    summary: 'Cria um rascunho de changeset para um Plano de Contas específico',
  })
  @Post()
  async createDraft(@Body() dto: CreateChangesetDto) {
    // O Controller apenas roteia a intenção para o motor do CQRS
    return this.commandBus.execute(
      new CreateDraftChangesetCommand(
        dto.id,
        dto.chartOfAccountsId,
        dto.incrementType,
        dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
      ),
    );
  }

  @ApiOperation({
    operationId: 'publishChangeset',
    summary: 'Publica um changeset para um Plano de Contas específico',
  })
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