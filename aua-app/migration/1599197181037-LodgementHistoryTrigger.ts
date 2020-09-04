import { MigrationInterface, QueryRunner } from 'typeorm';

export class LodgementHistoryTrigger1599197181037 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE OR REPLACE FUNCTION function_lodgement_history()
        RETURNS trigger AS
        $BODY$
        BEGIN
            INSERT INTO lodgement_history ("lodgementId", "lastUpdatedAt", name, status, "agentId",  "signedAt", fields)
            VALUES (NEW.id, NEW."lastUpdatedAt", NEW.name, NEW.status, NEW."agentId", NEW."signedAt", NEW.fields);
            RETURN NULL;
        END;
        $BODY$
        LANGUAGE plpgsql;
        `);
        await queryRunner.query(`
        CREATE TRIGGER lodgment_history_trigger AFTER INSERT OR UPDATE ON lodgement
        FOR EACH ROW EXECUTE PROCEDURE function_lodgement_history();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
