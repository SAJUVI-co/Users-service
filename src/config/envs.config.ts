import 'dotenv/config';
import * as joi from 'joi';

interface Envs {
  MYSQL_HOST: string;
  MYSQL_ROOT_PASSWORD: string;
  MYSQL_DATABASE: string;
  MYSQL_USER: string;
  MYSQL_PASSWORD: string;
  SERVER_HOST: string;
  SERVER_PORT: number;
  DOCKER_DB_PORT: number;
}

const schema = joi
  .object({
    MYSQL_HOST: joi.string().required(),
    MYSQL_ROOT_PASSWORD: joi.string().required(),
    MYSQL_DATABASE: joi.string().required(),
    MYSQL_USER: joi.string().required(),
    MYSQL_PASSWORD: joi.string().required(),
    DOCKER_DB_PORT: joi.number().required(),
    SERVER_HOST: joi.string().required(),
    SERVER_PORT: joi.number().required(),
  })
  .unknown(true);

const data = schema.validate(process.env);

if (data.error) {
  throw new Error(`Config validation error: ${data.error.message}`);
}

export const {
  MYSQL_ROOT_PASSWORD,
  MYSQL_DATABASE,
  MYSQL_USER,
  MYSQL_PASSWORD,
  DOCKER_DB_PORT,
  MYSQL_HOST,
  SERVER_HOST,
  SERVER_PORT,
} = data.value as Envs;
