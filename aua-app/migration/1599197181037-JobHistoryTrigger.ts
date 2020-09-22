import { MigrationInterface, QueryRunner } from 'typeorm';

export class JobHistoryTrigger1599197181037 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE OR REPLACE FUNCTION function_job_history()
        RETURNS trigger AS
        $BODY$
        BEGIN
            INSERT INTO job_history ("jobId", "lastUpdatedAt", name, status, "agentId",  "signedAt", fields)
            VALUES (NEW.id, NEW."lastUpdatedAt", NEW.name, NEW.status, NEW."agentId", NEW."signedAt", NEW.fields);
            RETURN NULL;
        END;
        $BODY$
        LANGUAGE plpgsql;
        `);
        await queryRunner.query(`
        CREATE TRIGGER job_history_trigger AFTER INSERT OR UPDATE ON job
        FOR EACH ROW EXECUTE PROCEDURE function_job_history();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
