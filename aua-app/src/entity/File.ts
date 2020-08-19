import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column({ default: 'system' })
  createdBy?: string;

  @Column()
  fileName: string;

  @Column()
  mime: string;

  @Column({ default: () => `timezone('UTC', now())` })
  lastAccess?: Date;

  @Column()
  location: string;

  @Column()
  md5: string;
}
