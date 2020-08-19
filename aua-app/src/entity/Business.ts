import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { File } from './File';
@Entity()
export class Business {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column({ default: () => `timezone('UTC', now())` })
    createdAt?: Date;

    @Column({ default: 'system' })
    createdBy?: string;

    @Column({ nullable: false, default: 'enabled' })
    status?: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({type: 'text', array: true, nullable: true })
    group: string[];

    @Column({ nullable: true })
    district: string;

    @Column({ nullable: true })
    website?: string;

    @Column({ nullable: true })
    ordinal?: number;

    @Column({ type: 'uuid' })
    imageId: File;
}


