import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIndexesInUserTable1597238387284 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "user_email_unique" on public."user" (LOWER(email))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "user_memberId_unique" on public."user" (UPPER("memberId"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
