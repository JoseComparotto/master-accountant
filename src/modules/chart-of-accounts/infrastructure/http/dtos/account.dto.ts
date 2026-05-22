import { AccountBalanceType } from "@modules/chart-of-accounts/domain/enums/account-balance-type.enum";
import { AccountClass } from "@modules/chart-of-accounts/domain/enums/account-class.enum";
import { ApiProperty } from "@nestjs/swagger";

export class AccountDto {

    @ApiProperty({
        description: 'UUID da conta',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id!: string;
    
    @ApiProperty({
        description: 'Código da conta no nível atual (sem considerar os níveis superiores)',
        example: 2
    })
    code!: number;

    @ApiProperty({
        description: 'Caminho completo da conta formatado conforme a máscara definida no Plano de Contas',
        example: '1.1.02'
    })
    path!: string;
    
    @ApiProperty({
        description: 'Indica se a conta é abstrata (sintética) ou analítica',
        example: false
    })
    isAbstract!: boolean;
    
    @ApiProperty({
        description: 'Nome da conta',
        example: 'Caixa'
    })
    name!: string;
    
    @ApiProperty({
        description: 'Tipo de saldo da conta',
        example: AccountBalanceType.DEBIT
    })
    balanceType!: AccountBalanceType;
    
    @ApiProperty({
        description: 'Classe da conta',
        example: AccountClass.ASSET
    })
    accountClass!: AccountClass;
}