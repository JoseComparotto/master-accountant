export interface CreateAccountInput {
  // Dados da Conta
  id?: string | null;
  chartId: string;
  parentId?: string | null;
  nodeCode?: number | null;
  name: string;
  description?: string | null;
  accountClass?: string | null;
  isContra: boolean;
  isAbstract: boolean;

  // Dados do Contexto de Alteração
  changesetId?: string | null;
  effectiveDate?: Date;
  autoPublish: boolean;
}