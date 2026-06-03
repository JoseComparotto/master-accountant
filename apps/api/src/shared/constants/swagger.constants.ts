import packageInfo from '../../../package.json';
import { OpenAPIObject } from '@nestjs/swagger';

type TagMetadata = NonNullable<OpenAPIObject['tags']>[number];

export const SWAGGER_API_INFO = {
    title: 'Master Accountant API',
    description: packageInfo.description ?? '',
    version: packageInfo.version,
    license: {
        name: packageInfo.license,
        url: ''
    },
} as const;

/**
 * Enum centralizado de Tags para uso nos Controllers @ApiTags()
 */
export enum SwaggerTag {
    CHART_OF_ACCOUNTS = 'Chart of Accounts (CoA)',
    GENERAL_LEDGER = 'General Ledger (GL)',
}

/**
 * Mapeamento detalhado de cada tag. 
 * O uso de Record<SwaggerTag, ...> obriga você a declarar metadados para 
 * TODAS as tags que adicionar no Enum.
 */
const TAGS_METADATA: Record<SwaggerTag, Omit<TagMetadata, 'name'>> = {
    [SwaggerTag.CHART_OF_ACCOUNTS]: {
        description: 'Gestão da estrutura hierárquica, naturezas e regras do Plano de Contas.',

    },
    [SwaggerTag.GENERAL_LEDGER]: {
    },
};

/**
 * Transforma o objeto de metadados no array que o SwaggerModule espera.
 */
export const SWAGGER_TAGS_ARRAY: TagMetadata[] = Object.entries(TAGS_METADATA).map(
    ([name, metadata]) => ({
        name,
        ...metadata,
    }),
);