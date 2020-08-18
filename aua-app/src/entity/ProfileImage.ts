import { Column, PrimaryGeneratedColumn, PrimaryColumn, Entity, Unique } from 'typeorm';

@Entity()
@Unique('index_user_id_x_image_id', ['userId', 'imageId'])
export class ProfileImage {
  @PrimaryColumn({ type: 'uuid' })
  userId!: string;

  @PrimaryColumn({ type: 'uuid' })
  imageId!: string;

  @Column({nullable: false, default: 0})
  ordinal: number;
}
