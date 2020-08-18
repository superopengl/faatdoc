import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUB0004User1597237455466 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO public."user" (id, email, "memberId", secret, salt, role, status, "expiryDate") VALUES ('86bf0d32-3e84-4cba-82c3-ab89bae9dace', 'techseeding2020@gmail.com', 'BU0004', 'c6a2ea7689179080b6b6ab4159b5060bccca853a345fa6308ee6d37861b72b26', 'f5e10d13-c478-48f1-83d3-4cd8aa73b676', 'business', 'enabled', '2021-12-31')`);
        await queryRunner.query(`INSERT INTO public.business_profile
        (id, "name", "secondaryName", phone, referrer, "approvalDirector", address, contact, facebook, instagram, website, remark) VALUES('86bf0d32-3e84-4cba-82c3-ab89bae9dace', 'Techseeding PTY LTD.', 'Techseeding', '0405581228', 'Benson', 'benson.yi', '', 'Jun Shao, Director mr.shaojun@gmail.com', '', '', 'https://www.techseeding.com.au', '专业IT技术合作伙伴，为小型企业、家庭小店、初创企业提供灵活快捷的专业IT信息技术服务')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
