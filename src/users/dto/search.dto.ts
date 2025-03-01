import { IsString } from 'class-validator';

export class ValidateUserExist {
  @IsString()
  username: string;

  @IsString()
  email: string;
}

export enum DateEnum {
  create = 'created_at',
  update = 'updated_at',
  delete = 'deleted_at',
}
