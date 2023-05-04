import { Migration } from '@mikro-orm/migrations';

export class Migration20230503060155 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "message" ("message_id" serial primary key, "sender_id" int not null, "receiver_id" int not null, "message" varchar(255) not null);');

    this.addSql('alter table "message" add constraint "message_sender_id_foreign" foreign key ("sender_id") references "users" ("id") on update cascade;');
    this.addSql('alter table "message" add constraint "message_receiver_id_foreign" foreign key ("receiver_id") references "users" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "message" cascade;');
  }

}
