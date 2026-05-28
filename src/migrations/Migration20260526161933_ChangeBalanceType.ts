import { Migration } from '@mikro-orm/migrations';

export class Migration20260526161933_ChangeBalanceType extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`alter table "coa"."account_node" add "is_contra" boolean not null, add "balance_type" text generated always as (
      CASE 
        WHEN (account_class IN ('asset', 'expense')) != is_contra
        THEN 'debit'
        ELSE 'credit'
      END
    ) STORED not null;`);

    this.addSql(`alter table "coa"."account_snapshot" drop constraint "account_snapshot_balance_type_check";`);
    this.addSql(`alter table "coa"."account_snapshot" drop column "balance_type";`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "coa"."account_node" drop column "is_contra", drop column "balance_type";`);

    this.addSql(`alter table "coa"."account_snapshot" add "balance_type" text not null;`);
    this.addSql(`alter table "coa"."account_snapshot" add constraint "account_snapshot_balance_type_check" check ("balance_type" in ('debit', 'credit'));`);
  }

}
