import { MigrationInterface, QueryRunner } from 'typeorm';

export class DefaultCronLock1599617100950 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO cron_lock ("gitHash", "lockedAt", by) VALUES ('0000000', timezone('UTC', now()), 'system')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
