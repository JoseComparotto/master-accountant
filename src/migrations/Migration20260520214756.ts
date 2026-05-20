import { Migration } from '@mikro-orm/migrations';

export class Migration20260520214756 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`alter table "coa"."chart_of_accounts" add "created_at" timestamptz not null default now();`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "coa"."chart_of_accounts" drop column "created_at";`);
  }

}
