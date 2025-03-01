import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserWithoutPassword } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';
import { By, UpdateUserDto } from './dto/update-user.dto';
// import { ValidateUserExist } from './dto/search.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RpcException } from '@nestjs/microservices';
import { DateEnum } from './dto/search.dto';
import { Errors } from 'src/utils/Erros';

@Injectable()
export class UserService {
  private readonly logger = new Logger('UserService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Crea al usuario
  async createUser(createUserDto: CreateUserDto): Promise<any> {
    try {
      const hashedPassword = await argon2.hash(createUserDto.password);

      const user: User = this.userRepository.create({
        ...createUserDto,
        email_recuperacion: createUserDto.email_recuperacion
          ? createUserDto.email_recuperacion
          : createUserDto.email,
        password: hashedPassword,
        rol: UserRole.INVITE, // Rol por defecto
        online: false, // Estado por defecto
      });

      const savedUser = await this.userRepository.save(user);
      if (!savedUser.id) {
        throw new RpcException({
          message: 'No users found',
          statusCode: 404,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = savedUser;
      return {
        access: true,
        status: 200,
      };
    } catch (error) {
      if (error instanceof Error) {
        const isDuplicateEntry = error.message.includes('Duplicate entry');
        throw new RpcException({
          message: isDuplicateEntry
            ? 'The user already exists. Please use another data.'
            : error.message,
          statusCode: 400,
        });
      }

      throw new RpcException({
        message: 'Unknown error',
        statusCode: 500,
      });
    }
  }

  //? SE NECESITAN LOS ROLES PARA DAR ACCEESO A ESTE METODO
  //! CHECK
  async findAllUsersPages(
    skip = 0,
    limit = 10,
    order: 'ASC' | 'DESC',
  ): Promise<[User[], number]> {
    try {
      const users = await this.userRepository.findAndCount({
        select: [
          'id',
          'username',
          'email',
          'email_recuperacion',
          'online',
          'rol',
          'created_at',
          'updated_at',
        ],
        skip,
        take: limit,
        order: { id: order },
      });

      if (users[1] === 0) {
        throw new RpcException({
          message: 'Users not found',
          statusCode: 400,
        });
      }
      return users;
    } catch (error: any) {
      throw new RpcException({
        message: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 400,
      });
    }
  }

  //? SE NECESITAN LOS ROLES PARA DAR ACCEESO A ESTE METODO
  async findAllSortedByDate(
    skip = 0,
    limit = 10,
    order: 'ASC' | 'DESC',
    date: DateEnum,
  ) {
    try {
      let data: object | undefined = undefined;

      // valida el tipo de solicitud que se desea
      switch (date) {
        case DateEnum.delete:
          data = {
            order: { deleted_at: order },
            withDeleted: true,
          };
          break;
        case DateEnum.update:
          data = {
            order: { updated_at: order },
          };
          break;

        case DateEnum.create:
          data = {
            order: { created_at: order },
            withDeleted: true,
          };
          break;

        default:
          break;
      }

      // error si no hay parametro
      if (data === undefined)
        throw new RpcException({
          message: 'parameter not found',
          statusCode: 400,
        });

      const users = await this.userRepository.find({
        ...data,
        select: [
          'id',
          'username',
          'email',
          'email_recuperacion',
          'online',
          'rol',
          'created_at',
          'updated_at',
          'deleted_at',
        ],
        withDeleted: true,
        skip,
        take: limit,
      });

      // error si Users not found
      if (!users || users.length === 0)
        throw new RpcException({
          message: 'Users not found',
          statusCode: 400,
        });

      return users;
    } catch (error: any) {
      throw new RpcException({
        message: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 400,
      });
    }
  }

  //? SE NECESITAN LOS ROLES PARA DAR ACCEESO A ESTE METODO
  async findOnlineUsers(): Promise<User[]> {
    const users = await this.userRepository.find({
      where: { online: true },
    });

    // error si no hay usuarios
    if (!users || users.length === 0)
      throw new RpcException({
        message: 'Users not found',
        statusCode: 400,
      });
    return users;
  }

  //? SE NECESITAN LOS ROLES PARA DAR ACCEESO A ESTE METODO
  async findByRole(role: UserRole): Promise<User[]> {
    try {
      const users = await this.userRepository.find({
        where: { rol: role },
      });

      // error si no hay usuarios
      if (!users || users.length === 0)
        throw new RpcException({
          message: 'Users not found',
          statusCode: 400,
        });

      return users;
    } catch (error: any) {
      throw new RpcException({
        message: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 400,
      });
    }
  }

  /**
   * Busca un usuario en la base de datos según un campo específico.
   *
   * @param {By} by - El campo por el cual se desea buscar (email, email_recuperacion o username).
   * @param {string} value - El valor del campo a consultar.
   * @returns {Promise<User>} - Retorna el usuario encontrado o lanza una excepción si no existe.
   *
   * @throws {NotFoundException} Si el parámetro `by` no es válido.
   * @throws {RpcException} Si ocurre un error inesperado.
   *
   * @example
   * // Buscar usuario por correo electrónico
   * const user = await findOneBy(By.email, 'example123@gmail.com');
   */
  async findOneBy(by: By, value: string): Promise<User> {
    try {
      if (by) Errors.NError('parameter not found');

      let data: object | undefined = undefined;

      // valida que campo es por el que se desea consultar
      switch (by) {
        case By.email:
          data = {
            email: value,
          };
          break;

        case By.email_recuperacion:
          data = {
            email_recuperacion: value,
          };
          break;

        case By.username:
          data = {
            username: value,
          };
          break;

        default:
          break;
      }

      // si no hay campo al que consultar, lanza error
      if (data === undefined)
        throw new RpcException({
          message: 'Users not found',
          statusCode: 400,
        });

      // realiza la consulta
      const user = await this.userRepository.findOne({
        where: data,
        select: [
          'id',
          'username',
          'email',
          'email_recuperacion',
          'online',
          'rol',
          'created_at',
          'updated_at',
          'deleted_at',
          'password',
        ],
        withDeleted: true,
      });

      // si no hay usuairos, lanza error
      if (!user || user === null)
        throw new RpcException({
          message: 'Users not found',
          statusCode: 400,
        });

      return user;
    } catch (error: any) {
      throw new RpcException({
        message: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 400,
      });
    }
  }

  // busca un usuario
  private async findOneById(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!user || user === null)
      throw new RpcException({
        message: 'Users not found',
        statusCode: 400,
      });

    return user;
  }

  // retorna el usuario
  async login(loginUserDto: LoginUserDto) {
    try {
      const user = await this.findOneBy(By.username, loginUserDto.username);
      const compare_password = await argon2.verify(
        user.password,
        loginUserDto.password,
      );

      if (!compare_password)
        throw new RpcException({
          message: 'Invalid Credentials',
          statusCode: 401,
        });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      //! INJECTAR LA VALIDACION DE LA SESCION PARA ACTUALIZAR EL ESTADO
      // - SI LA SESIION ESTA ABIERTA, NO LA ACTUALIZA
      // - SI NO, LA ACTUALIZA
      await this.updateOnlineStatus(userWithoutPassword);
      return userWithoutPassword;
    } catch (error: any) {
      throw new RpcException({
        message: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 400,
      });
    }
  }

  //* Hay que configurarlo para que solo permita realiar los cambios al mismo usuario
  //  es decir, solo el usuario que tiene la sesion abierta, debe poder
  //  realizar dichos cambios
  // - o que se valide el rol del mismo para que permita rezalizar los cambios a otros usuarios
  async updateUserSameUser(udpateUserDto: UpdateUserDto): Promise<boolean> {
    try {
      if (!udpateUserDto.id)
        throw new RpcException({
          message: 'Parameter not found',
          statusCode: 400,
        });

      const user = await this.findOneById(Number(udpateUserDto.id));

      if (!user || user === null)
        throw new RpcException({
          message: 'Users not found',
          statusCode: 400,
        });

      if (user) {
        Object.assign(user, udpateUserDto);
        this.logger.log(`user ${user.id} has been updated`);
      }

      return user && (await this.userRepository.save(user)) ? true : false;
    } catch (error: any) {
      throw new RpcException({
        message: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 400,
      });
    }
  }

  // actualiza el estado online
  // * Solo puede cerrar la sesion, si el usuario esta activo,
  //   si el usuario no esta activo, no realiza el cambio
  private async updateOnlineStatus(user: UserWithoutPassword) {
    if (!user)
      throw new RpcException({
        message: 'Users not found',
        statusCode: 400,
      });

    const user_online = !user.online;
    user.online = user_online;
    const user_updated = await this.userRepository.save(user);
    return user_updated;
  }

  async softDeleteOne(id: number) {
    const result = await this.userRepository.softDelete(id);
    if (!result || result === null)
      throw new RpcException({
        message: 'User not found',
        statusCode: 401,
      });

    return 'ok';
  }

  async deleteOne(id: number) {
    const result = await this.userRepository.softDelete(id);
    if (!result || result === null)
      throw new RpcException({
        message: 'User not found',
        statusCode: 400,
      });

    return 'ok';
  }
}
