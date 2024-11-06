import { Role } from 'src/enums/role.enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'Users' })
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ length: 63 })
  name: string;

  @Column({ length: 127 })
  email: string;

  @Column()
  password: string;

  @Column({ enum: [1, 2], default: 1 })
  role: Role;

  @Column({ type: 'date' })
  birthAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
