import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty({ message: 'El nombre de usuario no puede estar vacío' })
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  username: string; // EL USUARIO ES LA CÉDULA

  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;
}
