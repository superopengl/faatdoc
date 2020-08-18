import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Image } from './Image';

@Entity()
export class Poster {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ default: () => `timezone('UTC', now())` })
    createdAt?: Date;

    @Column({default: 'system'})
    createdBy?: string;

    @Column({ nullable: false, default: 'enabled' })
    status?: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    ordinal?: number;

    @Column({ type: 'uuid' })
    imageId: string;
}


