import { SWAGGER_TAGS } from '@shared/constants/swagger.constants';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Post, Body, Param } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { CreateChangesetBodyDto } from '@modules/chart-of-accounts/infrastructure/http/dtos/create-changeset-body.dto';
import { PublishChangesetBodyDto } from '@modules/chart-of-accounts/infrastructure/http/dtos/publish-changeset-body.dto';

import { CreateDraftChangesetCommand } from '@modules/chart-of-accounts/application/commands/create-draft-changeset.command';
import { PublishChangesetCommand } from '@modules/chart-of-accounts/application/commands/publish-changeset.command';
import { DiscardChangesetCommand } from '@modules/chart-of-accounts/application/commands/discard-changeset.command';

@ApiTags(SWAGGER_TAGS.CHART_OF_ACCOUNTS.name)
@Controller('changesets')
export class ChangesetsController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({
    operationId: 'createDraftChangeset',
    summary: 'Cria um rascunho de changeset para um Plano de Contas específico',
  })
  @ApiResponse({
    status: 201,
    description: 'Changeset criado com sucesso.',
  })
  @Post()
  async createDraft(@Body() dto: CreateChangesetBodyDto) {
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
  @ApiResponse({
    status: 200,
    description: 'Changeset publicado com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Changeset não encontrado.',
  })
  async publishChangeset(
    @Param('id') id: string,
    @Body() dto: PublishChangesetBodyDto,
  ) {
    return this.commandBus.execute(
      new PublishChangesetCommand(
        id, 
        dto.effectiveDate ? new Date(dto.effectiveDate) : undefined
      ),
    );

  }
  
  @ApiOperation({
    operationId: 'discardChangeset',
    summary: 'Descarta um changeset, cancelando a proposta de alteração e devolvendo as reservas de node codes das contas criadas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Changeset descartado com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Changeset não encontrado.',
  })
  @Post(':id/discard')
  async discardChangeset(@Param('id') id: string) {
    return this.commandBus.execute(new DiscardChangesetCommand(id));
  }
}