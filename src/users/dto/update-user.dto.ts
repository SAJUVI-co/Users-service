import {
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

enum UserOnline {
  ONLINE = 'true',
  OFFLINE = 'false',
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
  @IsEnum(UserOnline, { message: 'El estado en línea debe ser: true o false' })
  online?: UserOnline;
}
