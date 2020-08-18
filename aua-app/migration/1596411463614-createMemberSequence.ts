import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMemberSequence1596411463614 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS individual_member_id INCREMENT BY 1 START WITH 100`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS business_member_id INCREMENT BY 1 START WITH 100`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
