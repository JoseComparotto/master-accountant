import { Migration } from '@mikro-orm/migrations';

export class Migration20260526150122_UniqueIndexes extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`alter table "coa"."account_node" add "account_class" text not null;`);
    this.addSql(`create index "idx_node_code_unique_root_per_coa" on "coa"."account_node" ("chart_of_accounts_id", "node_code");`);
    this.addSql(`create index "idx_node_code_unique_per_parent" on "coa"."account_node" ("parent_id", "node_code");`);
    this.addSql(`create index "idx_unique_root_per_class_and_coa" on "coa"."account_node" ("chart_of_accounts_id", "account_class");`);
    this.addSql(`alter table "coa"."account_node" add constraint "account_node_account_class_check" check ("account_class" in ('asset', 'liability', 'equity', 'revenue', 'expense'));`);

    this.addSql(`alter table "coa"."account_snapshot" drop constraint "account_snapshot_account_class_check";`);
    this.addSql(`alter table "coa"."account_snapshot" drop column "account_class";`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop index "coa"."idx_node_code_unique_root_per_coa";`);
    this.addSql(`drop index "coa"."idx_node_code_unique_per_parent";`);
    this.addSql(`drop index "coa"."idx_unique_root_per_class_and_coa";`);
    this.addSql(`alter table "coa"."account_node" drop constraint "account_node_account_class_check";`);
    this.addSql(`alter table "coa"."account_node" drop column "account_class";`);

    this.addSql(`alter table "coa"."account_snapshot" add "account_class" text not null;`);
    this.addSql(`alter table "coa"."account_snapshot" add constraint "account_snapshot_account_class_check" check ("account_class" in ('asset', 'liability', 'equity', 'revenue', 'expense'));`);
  }

}
