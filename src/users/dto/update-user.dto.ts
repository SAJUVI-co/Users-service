import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

enum UserRole {
  SUPERADMIN = 'sudo',
  ADMIN = 'admin',
  INVITE = 'invite',
}

export enum By {
  email = 'email',
  email_recuperacion = 'email_recuperacion',
  username = 'username',
}

export class UpdateUserDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  username?: string; // EL USUARIO ES LA CÉDULA

  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  email?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo de recuperación debe ser válido' })
  email_recuperacion?: string;

  @IsOptional()
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser uno de: sudo, admin, invite' })
  rol?: UserRole;

  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser true | false' })
  online?: boolean;
}
