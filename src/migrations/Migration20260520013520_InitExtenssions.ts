import { Migration } from '@mikro-orm/migrations';

export class Migration20260520013520_InitExtenssions extends Migration {

  override up(): void | Promise<void> {
    this.addSql('CREATE EXTENSION IF NOT EXISTS ltree;');
  }

  override down(): void | Promise<void> {
    this.addSql('DROP EXTENSION IF EXISTS ltree;');
  }

}
