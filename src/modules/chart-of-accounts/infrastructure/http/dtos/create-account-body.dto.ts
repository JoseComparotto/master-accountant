import { AccountClass } from "@modules/chart-of-accounts/domain/enums/account-class.enum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsUUID, MaxLength } from "class-validator";

export class CreateAccountBodyDto {

    @ApiPropertyOptional({
        description: 'UUID gerado pelo cliente para garantia de idempotência. Se não fornecido, o sistema irá gerar um novo UUID v4.',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID('4', { message: 'Se fornecido, o ID deve ser um UUID v4 válido.' })
    id?: string;

    @ApiPropertyOptional({
        description: 'UUID do pai do conta. Se não fornecido, a conta será criada como raiz.',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID('4', { message: 'Se fornecido, o ID do pai deve ser um UUID v4 válido.' })
    parentId?: string;

    @ApiPropertyOptional({
        description: 'Código numérico da conta. Se fornecido, deve ser um número inteiro e único dentro do mesmo nível hierárquico. Se não fornecido, o sistema irá atribuir automaticamente o próximo código disponível dentro do nível do pai.',
        example: 1
    })
    @IsInt({ message: 'Se fornecido, o nodeCode deve ser um número inteiro.' })
    @IsOptional()
    nodeCode?: number;

    @ApiProperty({
        description: 'Nome da conta. Deve ser único e descritivo.',
        example: 'Ativo Circulante'
    })
    @MaxLength(255, { message: 'O nome da conta deve ter no máximo 255 caracteres.' })
    name!: string;

    @ApiPropertyOptional({
        description: 'Descrição opcional da conta para fornecer informações adicionais.',
        example: 'Esta conta é usada para registrar os ativos circulantes da empresa, como caixa, bancos e estoques.'
    })
    @IsOptional()
    @MaxLength(1000, { message: 'A descrição da conta deve ter no máximo 1000 caracteres.' })
    description?: string;

    @ApiPropertyOptional({
        description: 'Classe da conta. Obrigatório apenas para contas raiz. Para contas filhas, a classe é herdada do pai e este campo deve ser omitido, nulo ou igual à do pai.',
        example: AccountClass.ASSET,
        enumName: 'AccountClass',
        enum: AccountClass
    })
    @IsOptional()
    @IsEnum(AccountClass, { message: 'A classe da conta deve ser um valor válido do enum AccountClass: "asset", "liability", "equity", "revenue" ou "expense"' })
    accountClass?: AccountClass;

    @ApiPropertyOptional({
        description: 'Indica se a conta é uma conta redutora.',
        example: false
    })
    @IsOptional()
    @IsBoolean({ message: 'O campo isContra deve ser um valor booleano.' })
    isContra: boolean = false; // Conta redutora

    @ApiProperty({
        description: 'Indica se a conta é sintética (não pode ter lançamentos diretos, apenas servir como agrupadora de contas filhas).',
        example: false
    })
    @IsBoolean({ message: 'O campo isAbstract deve ser um valor booleano.' })
    isAbstract!: boolean;
}