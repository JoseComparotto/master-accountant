import { Migration } from '@mikro-orm/migrations';

export class Migration20260520202845_InitSchema extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create schema if not exists "coa";`);
    this.addSql(`create table "coa"."chart_of_accounts" ("id" uuid not null, "name" varchar(255) not null, "level_widths" integer[] not null, "is_active" boolean not null default true, primary key ("id"));`);

    this.addSql(`create table "coa"."account_changeset" ("id" uuid not null, "chart_of_accounts_id" uuid not null, "increment_type" text not null, "status" text not null default 'draft', "effective_date" date null, "created_at" timestamptz not null, "published_at" timestamptz null, primary key ("id"));`);

    this.addSql(`create table "coa"."account_node" ("id" uuid not null, "chart_of_accounts_id" uuid not null, "parent_id" uuid null, "is_abstract" boolean not null, "node_code" int not null, "path_ltree" ltree not null, "formatted_code" varchar(255) not null, "current_snapshot_id" uuid null, primary key ("id"));`);
    this.addSql(`alter table "coa"."account_node" add constraint "account_node_current_snapshot_id_unique" unique ("current_snapshot_id");`);
    this.addSql(`create index "idx_account_node_path_ltree" on "coa"."account_node" ("path_ltree");`);
    this.addSql(`alter table "coa"."account_node" add constraint "account_node_chart_of_accounts_id_formatted_code_unique" unique ("chart_of_accounts_id", "formatted_code");`);

    this.addSql(`create table "coa"."account_transition" ("id" uuid not null, "changeset_id" uuid not null, "transition_type" text not null, "source_node_id" uuid null, "target_node_id" uuid null, "change_reason" varchar(255) null, "created_at" timestamptz not null, "effective_date" date null, primary key ("id"));`);

    this.addSql(`create table "coa"."account_snapshot" ("id" uuid not null, "node_id" uuid not null, "changeset_id" uuid not null, "previous_snapshot_id" uuid null, "name" varchar(255) not null, "balance_type" varchar(255) not null, "group_type" varchar(255) not null, "change_reason" varchar(255) null, "created_at" timestamptz not null, "effective_date" date null, primary key ("id"));`);

    this.addSql(`alter table "coa"."account_changeset" add constraint "account_changeset_chart_of_accounts_id_foreign" foreign key ("chart_of_accounts_id") references "coa"."chart_of_accounts" ("id");`);
    this.addSql(`alter table "coa"."account_changeset" add constraint "account_changeset_increment_type_check" check ("increment_type" in ('major', 'minor'));`);
    this.addSql(`alter table "coa"."account_changeset" add constraint "account_changeset_status_check" check ("status" in ('draft', 'published', 'discarded'));`);

    this.addSql(`alter table "coa"."account_node" add constraint "account_node_chart_of_accounts_id_foreign" foreign key ("chart_of_accounts_id") references "coa"."chart_of_accounts" ("id");`);
    this.addSql(`alter table "coa"."account_node" add constraint "account_node_parent_id_foreign" foreign key ("parent_id") references "coa"."account_node" ("id") on delete set null;`);
    this.addSql(`alter table "coa"."account_node" add constraint "account_node_current_snapshot_id_foreign" foreign key ("current_snapshot_id") references "coa"."account_snapshot" ("id") on delete set null;`);

    this.addSql(`alter table "coa"."account_transition" add constraint "account_transition_changeset_id_foreign" foreign key ("changeset_id") references "coa"."account_changeset" ("id");`);
    this.addSql(`alter table "coa"."account_transition" add constraint "account_transition_source_node_id_foreign" foreign key ("source_node_id") references "coa"."account_node" ("id") on delete set null;`);
    this.addSql(`alter table "coa"."account_transition" add constraint "account_transition_target_node_id_foreign" foreign key ("target_node_id") references "coa"."account_node" ("id") on delete set null;`);
    this.addSql(`alter table "coa"."account_transition" add constraint "account_transition_transition_type_check" check ("transition_type" in ('creation', 'split', 'merge', 'discontinue', 'reclassify'));`);

    this.addSql(`alter table "coa"."account_snapshot" add constraint "account_snapshot_node_id_foreign" foreign key ("node_id") references "coa"."account_node" ("id");`);
    this.addSql(`alter table "coa"."account_snapshot" add constraint "account_snapshot_changeset_id_foreign" foreign key ("changeset_id") references "coa"."account_changeset" ("id");`);
    this.addSql(`alter table "coa"."account_snapshot" add constraint "account_snapshot_previous_snapshot_id_foreign" foreign key ("previous_snapshot_id") references "coa"."account_snapshot" ("id") on delete set null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "coa"."account_changeset" drop constraint "account_changeset_chart_of_accounts_id_foreign";`);
    this.addSql(`alter table "coa"."account_node" drop constraint "account_node_chart_of_accounts_id_foreign";`);
    this.addSql(`alter table "coa"."account_transition" drop constraint "account_transition_changeset_id_foreign";`);
    this.addSql(`alter table "coa"."account_snapshot" drop constraint "account_snapshot_changeset_id_foreign";`);
    this.addSql(`alter table "coa"."account_node" drop constraint "account_node_parent_id_foreign";`);
    this.addSql(`alter table "coa"."account_transition" drop constraint "account_transition_source_node_id_foreign";`);
    this.addSql(`alter table "coa"."account_transition" drop constraint "account_transition_target_node_id_foreign";`);
    this.addSql(`alter table "coa"."account_snapshot" drop constraint "account_snapshot_node_id_foreign";`);
    this.addSql(`alter table "coa"."account_node" drop constraint "account_node_current_snapshot_id_foreign";`);
    this.addSql(`alter table "coa"."account_snapshot" drop constraint "account_snapshot_previous_snapshot_id_foreign";`);

    this.addSql(`drop table if exists "coa"."chart_of_accounts" cascade;`);
    this.addSql(`drop table if exists "coa"."account_changeset" cascade;`);
    this.addSql(`drop table if exists "coa"."account_node" cascade;`);
    this.addSql(`drop table if exists "coa"."account_transition" cascade;`);
    this.addSql(`drop table if exists "coa"."account_snapshot" cascade;`);

    this.addSql(`drop schema if exists "coa";`);
  }

}
