import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  SUPERADMIN = 'sudo',
  ADMIN = 'admin',
  INVITE = 'invite',
}

export enum UserOnline {
  ONLINE = 'true',
  OFFLINE = 'false',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    nullable: false,
    comment: 'El usuario es la cédula',
  })
  username: string;

  @Column({
    unique: true,
    nullable: false,
    comment: 'Correo electrónico del usuario',
  })
  email: string;

  @Column({ comment: 'Correo electrónico de recuperación' })
  email_recuperacion: string;

  @Column({ nullable: false, comment: 'Contraseña del usuario' })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.INVITE,
    nullable: false,
    comment: 'Rol del usuario (sudo, admin, invite)',
  })
  rol: UserRole;

  @Column({
    type: 'enum',
    enum: UserOnline,
    nullable: false,
    comment: 'Estado de conexión del usuario (online/offline)',
  })
  online: UserOnline;

  @CreateDateColumn({
    nullable: false,
    comment: 'Fecha de creación del usuario',
  })
  created_at: Date;

  @UpdateDateColumn({
    nullable: false,
    comment: 'Fecha de última actualización del usuario',
  })
  updated_at: Date;

  @DeleteDateColumn({
    comment: 'Fecha de eliminación del usuario (soft delete)',
  })
  deleted_at: Date;
}
