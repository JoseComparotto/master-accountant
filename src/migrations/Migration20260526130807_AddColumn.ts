import { Migration } from '@mikro-orm/migrations';

export class Migration20260526130807_AddColumn extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`alter table "coa"."account_node" add "inactivation_changeset_id" uuid null;`);
    this.addSql(`alter table "coa"."account_node" add constraint "account_node_inactivation_changeset_id_foreign" foreign key ("inactivation_changeset_id") references "coa"."account_changeset" ("id") on delete set null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "coa"."account_node" drop constraint "account_node_inactivation_changeset_id_foreign";`);

    this.addSql(`alter table "coa"."account_node" drop column "inactivation_changeset_id";`);
  }

}
