import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'El nombre de usuario no puede estar vacío' })
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  username: string; // EL USUARIO ES LA CÉDULA

  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío' })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  email: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo de recuperación debe ser válido' })
  email_recuperacion?: string;

  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;
}
