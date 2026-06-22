import { Migration } from '@mikro-orm/migrations';

export class Migration20260622162349 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table \`chart_of_accounts\` (\`id\` text not null primary key, \`version\` integer check (version >=0) not null default 1, \`updated_at\` datetime not null default 'CURRENT_TIMESTAMP');`);

    this.addSql(`create table \`accounts\` (\`id\` text not null primary key, \`name\` text check (length(name) between 3 and 100) not null, \`description\` text null, \`code_segments\` json not null, \`account_class\` text check (\`account_class\` in ('asset', 'liability', 'equity', 'income', 'expense')) not null, \`balance_type\` text generated always as (
            CASE 
                WHEN (
                    account_class IN (
                        'asset',
                        'expense'
                    )
                ) != is_contra
                THEN 'debit'
                ELSE 'credit'
            END
        ) STORED check (\`balance_type\` in ('debit', 'credit')), \`is_summary\` integer not null, \`is_contra\` integer not null, \`is_active\` integer not null, \`chart_id\` text not null, \`parent_id\` text null, constraint \`accounts_chart_id_foreign\` foreign key (\`chart_id\`) references \`chart_of_accounts\` (\`id\`), constraint \`accounts_parent_id_foreign\` foreign key (\`parent_id\`) references \`accounts\` (\`id\`) on delete set null);`);
    this.addSql(`create index \`accounts_chart_id_index\` on \`accounts\` (\`chart_id\`);`);
    this.addSql(`create index \`accounts_parent_id_index\` on \`accounts\` (\`parent_id\`);`);
  }

  override down(): void | Promise<void> {

    this.addSql(`drop table if exists \`chart_of_accounts\`;`);
    this.addSql(`drop table if exists \`accounts\`;`);
  }

}
