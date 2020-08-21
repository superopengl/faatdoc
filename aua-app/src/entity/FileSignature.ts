import { Column, PrimaryColumn, Entity } from 'typeorm';

@Entity()
export class FileSignature {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  lodgementFileId: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column('uuid')
  fileId: string;

  @Column({ nullable: true })
  signedAt?: Date;

  @Column('uuid')
  signedBy?: string;
}
