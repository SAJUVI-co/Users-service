import { IsString } from 'class-validator';

export class ValidateUserExist {
  @IsString()
  username: string;

  @IsString()
  email: string;
}
