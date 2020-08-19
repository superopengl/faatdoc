import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { File } from './File';
@Entity()
export class Gallery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column({ default: 'system' })
  createdBy?: string;

  @Column({ nullable: false, default: 'enabled' })
  status?: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  ordinal?: number;

  @Column({ nullable: false })
  group: string;

  @Column({ nullable: true })
  when?: Date;

  @Column({ type: 'uuid', nullable: true })
  imageId: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({default: 'image'})
  type: string;
}
