import { Migration } from '@mikro-orm/migrations';

export class Migration20260526162017_AccountNodeStrictIntegrity extends Migration {


  override up(): void {
    // 1. Função para Bloquear Updates em Campos Blacklistados
    this.addSql(`
      CREATE OR REPLACE FUNCTION coa.fn_validate_node_immutability()
      RETURNS TRIGGER AS $$
      BEGIN
          -- Blacklist de campos que NUNCA podem mudar
          IF NEW.id != OLD.id THEN 
            RAISE EXCEPTION 'Campo id é imutável.'; END IF;

          IF NEW.chart_of_accounts_id != OLD.chart_of_accounts_id THEN 
            RAISE EXCEPTION 'Campo chart_of_accounts_id é imutável.'; END IF;
          
          IF NEW.parent_id IS DISTINCT FROM OLD.parent_id THEN 
            RAISE EXCEPTION 'Campo parent_id é imutável. Para mover uma conta, use uma Transição estrutural (R02).'; END IF;
          
          IF NEW.account_class != OLD.account_class THEN 
            RAISE EXCEPTION 'Campo account_class é imutável.'; END IF;           
          
          IF NEW.is_contra != OLD.is_contra THEN 
              RAISE EXCEPTION 'Campo is_contra é imutável.';END IF;
          
          IF NEW.is_abstract != OLD.is_abstract THEN 
            RAISE EXCEPTION 'Campo is_abstract é imutável.'; END IF;
          
          IF NEW.node_code != OLD.node_code THEN 
            RAISE EXCEPTION 'Campo node_code é imutável.'; END IF;
          
          IF NEW.creation_changeset_id != OLD.creation_changeset_id THEN 
            RAISE EXCEPTION 'Campo creation_changeset_id é imutável.'; END IF;

          -- Regras de Whitelist com Condicionais
          
          -- current_snapshot_id: uma vez definido não-nulo, não pode se tornar nulo
          IF OLD.current_snapshot_id IS NOT NULL AND NEW.current_snapshot_id IS NULL THEN
              RAISE EXCEPTION 'O current_snapshot_id não pode ser removido após ser definido.';
          END IF;

          -- inactivation_changeset_id: só pode ser alterado se era nulo (morte única)
          IF OLD.inactivation_changeset_id IS NOT NULL AND NEW.inactivation_changeset_id IS DISTINCT FROM OLD.inactivation_changeset_id THEN
              RAISE EXCEPTION 'O inactivation_changeset_id já foi definido e não pode ser alterado.';
          END IF;

          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 2. Função para Validar a Criação (Compatibilidade com o Pai)
    this.addSql(`
      CREATE OR REPLACE FUNCTION coa.fn_validate_node_creation_integrity()
      RETURNS TRIGGER AS $$
      DECLARE
          p_coa_id uuid;
          p_class text;
          p_is_abstract boolean;
          p_is_contra boolean;
      BEGIN
          -- Se for raiz, não há pai para validar
          IF NEW.parent_id IS NULL THEN
              RETURN NEW;
          END IF;

          -- Busca metadados do pai
          SELECT chart_of_accounts_id, account_class, is_abstract, is_contra
          INTO p_coa_id, p_class, p_is_abstract, p_is_contra
          FROM coa.account_node WHERE id = NEW.parent_id;

          -- R01: COA deve ser o mesmo
          IF p_coa_id != NEW.chart_of_accounts_id THEN
              RAISE EXCEPTION 'Inconsistência R01: O Nó pai pertence a um Plano de Contas diferente.';
          END IF;

          -- Integridade de Classe: Deve ser a mesma do pai
          IF p_class != NEW.account_class THEN
              RAISE EXCEPTION 'Inconsistência: A classe % diverge da classe do pai %.', NEW.account_class, p_class;
          END IF;

          -- Integridade de Natureza Redutora: Se o pai for redutor (is_contra = true), o filho também deve ser redutor.
          IF p_is_contra AND NOT NEW.is_contra THEN
              RAISE EXCEPTION 'Inconsistência: O Nó pai é redutor (is_contra = true), portanto o filho também deve ser redutor.';
          END IF;

          -- R11: Bloqueio de Pai Analítico (Pai deve ser Sintético/Abstrato)
          -- Nota: Ajustado conforme sua regra de que apenas Sintéticos (isAbstract = true) podem ser pais
          IF p_is_abstract IS FALSE THEN
              RAISE EXCEPTION 'R11: O nó pai % é analítico e não pode possuir descendentes.', NEW.parent_id;
          END IF;

          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 3. Aplicação dos Triggers

    // Imutabilidade (BEFORE UPDATE): Intercepta antes de tentar persistir
    this.addSql(`
      CREATE TRIGGER trg_node_immutability
      BEFORE UPDATE ON coa.account_node
      FOR EACH ROW EXECUTE FUNCTION coa.fn_validate_node_immutability();
    `);

    // Integridade de Criação (AFTER INSERT): Usamos CONSTRAINT DEFERRED para garantir que o ORM
    // possa persistir em lotes, validando tudo no final do commit.
    this.addSql(`
      CREATE CONSTRAINT TRIGGER trg_node_creation_integrity
      AFTER INSERT ON coa.account_node
      DEFERRABLE INITIALLY DEFERRED
      FOR EACH ROW EXECUTE FUNCTION coa.fn_validate_node_creation_integrity();
    `);
  }

  override down(): void {
    this.addSql(`DROP TRIGGER IF EXISTS trg_node_immutability ON coa.account_node;`);
    this.addSql(`DROP TRIGGER IF EXISTS trg_node_creation_integrity ON coa.account_node;`);
    this.addSql(`DROP FUNCTION IF EXISTS coa.fn_validate_node_immutability();`);
    this.addSql(`DROP FUNCTION IF EXISTS coa.fn_validate_node_creation_integrity();`);
  }

}
