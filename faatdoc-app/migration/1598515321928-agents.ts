import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAgents1598515321928 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO public."user" (id, email, "givenName", "surname", secret, salt, role, status) 
        VALUES ('87145c51-1ff9-4150-8268-3bf0b5914b71', 'jzhou@auao.com.au', 'Jinlin', 'Zhou', 'd17ded725a5199e93deb94c425ff92f7856376a09bb3d8afa3e69c17f32c6ac9', 'cdb60793-002f-4afa-b91a-c03ff22b621a', 'agent', 'enabled')`);
        await queryRunner.query(`INSERT INTO public."user" (id, email, "givenName", "surname", secret, salt, role, status) 
        VALUES ('2c1b5765-ba67-44a5-9303-db1c94ceb79f', 'accountant@auao.com.au', '', '', '5ee1f5db58215673d2f20b107b8e6a3890ec678a13107d69d8231b922ce703b6', '5db8c952-a0ce-40cf-ae2e-ee57af73a2e1', 'agent', 'enabled')`);
        await queryRunner.query(`INSERT INTO public."user" (id, email, "givenName", "surname", secret, salt, role, status) 
        VALUES ('5e1ac3a9-9caf-4cf9-9584-b5bd72f36db5', 'info@auao.com.au', '', '', '6cf100208f40a135fe6e82c6d1f96a570b96c9dc4a15637cca0b1ed2fe0e6f6c', 'be19e564-12c8-427d-86b8-71891c63a3a6', 'agent', 'enabled')`);
        await queryRunner.query(`INSERT INTO public."user" (id, email, "givenName", "surname", secret, salt, role, status) 
        VALUES ('5e1ac3a9-9caf-4cf9-9584-b5bd72f36db5', 'accountantcrm@auao.com.au', '', '', '44300e75ad3d30400d6d93be7b59c35029b9eabf8bd27e1ca058eca22ba0bd72', '69ec6385-f347-49d1-8c95-bd0361369778', 'agent', 'enabled')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
