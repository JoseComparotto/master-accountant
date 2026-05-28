import { Migration } from '@mikro-orm/migrations';

export class Migration20260526174659_AddDescription extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`alter table "coa"."account_snapshot" add "description" varchar(255) null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "coa"."account_snapshot" drop column "description";`);
  }

}
