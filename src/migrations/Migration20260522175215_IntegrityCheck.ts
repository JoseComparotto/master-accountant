import { Migration } from '@mikro-orm/migrations';

export class Migration20260522175215_IntegrityCheck extends Migration {

  override async up(): Promise<void> {
    // 1. Função para validar a integridade partindo do FILHO para o PAI
    // Protege contra: Inserir ou atualizar um snapshot/transition com status diferente do changeset atual
    this.addSql(`
      CREATE OR REPLACE FUNCTION coa.fn_validate_child_status_integrity()
      RETURNS TRIGGER AS $$
      DECLARE
          parent_status text;
      BEGIN
          SELECT status INTO parent_status FROM coa.account_changeset WHERE id = NEW.changeset_id;
          
          IF parent_status IS NOT NULL AND NEW.status != parent_status THEN
              RAISE EXCEPTION 'Integridade de Status Violada: O registro filho (%) tem status %, mas o Changeset pai (%) está como %', 
                  NEW.id, NEW.status, NEW.changeset_id, parent_status;
          END IF;
          RETURN NULL; -- Em AFTER triggers o retorno é ignorado
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 2. Função para validar a integridade partindo da MÃE para os FILHOS
    // Protege contra: Alterar o status do Changeset (ex: para PUBLISHED) sem ter atualizado os filhos na mesma transação
    this.addSql(`
      CREATE OR REPLACE FUNCTION coa.fn_validate_mother_status_integrity()
      RETURNS TRIGGER AS $$
      BEGIN
          IF EXISTS (SELECT 1 FROM coa.account_snapshot WHERE changeset_id = NEW.id AND status != NEW.status) THEN
              RAISE EXCEPTION 'Integridade de Status Violada: O Changeset % mudou para %, mas existem Snapshots pendentes com status antigo.', NEW.id, NEW.status;
          END IF;
          
          IF EXISTS (SELECT 1 FROM coa.account_transition WHERE changeset_id = NEW.id AND status != NEW.status) THEN
              RAISE EXCEPTION 'Integridade de Status Violada: O Changeset % mudou para %, mas existem Transições pendentes com status antigo.', NEW.id, NEW.status;
          END IF;
          
          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 3. Aplicação dos Constraint Triggers (DEFERRABLE)
    // Usamos AFTER para permitir a verificação apenas no final da transação (COMMIT)

    this.addSql(`
      CREATE CONSTRAINT TRIGGER trg_snapshot_status_integrity
      AFTER INSERT OR UPDATE ON coa.account_snapshot
      DEFERRABLE INITIALLY DEFERRED
      FOR EACH ROW EXECUTE FUNCTION coa.fn_validate_child_status_integrity();
    `);

    this.addSql(`
      CREATE CONSTRAINT TRIGGER trg_transition_status_integrity
      AFTER INSERT OR UPDATE ON coa.account_transition
      DEFERRABLE INITIALLY DEFERRED
      FOR EACH ROW EXECUTE FUNCTION coa.fn_validate_child_status_integrity();
    `);

    this.addSql(`
      CREATE CONSTRAINT TRIGGER trg_changeset_status_integrity
      AFTER UPDATE ON coa.account_changeset
      DEFERRABLE INITIALLY DEFERRED
      FOR EACH ROW EXECUTE FUNCTION coa.fn_validate_mother_status_integrity();
    `);
  }

  override async down(): Promise<void> {
    // Remoção dos Triggers
    this.addSql(`DROP TRIGGER IF EXISTS trg_snapshot_status_integrity ON coa.account_snapshot;`);
    this.addSql(`DROP TRIGGER IF EXISTS trg_transition_status_integrity ON coa.account_transition;`);
    this.addSql(`DROP TRIGGER IF EXISTS trg_changeset_status_integrity ON coa.account_changeset;`);

    // Remoção das Funções
    this.addSql(`DROP FUNCTION IF EXISTS coa.fn_validate_child_status_integrity();`);
    this.addSql(`DROP FUNCTION IF EXISTS coa.fn_validate_mother_status_integrity();`);
  }

}
