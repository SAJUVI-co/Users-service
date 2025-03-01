import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserWithoutPassword } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';
import { UpdateUserDto } from './dto/update-user.dto';
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
      if (error instanceof Error) {
        throw new RpcException({
          message: error.message,
          statusCode: 400,
        });
      } else {
        throw new RpcException({
          message: 'Unknown error',
          statusCode: 500,
        });
      }
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

      if (data === undefined) Errors.NError('Parameter not found');

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

      if (!users || users.length === 0)
        throw new NotFoundException('No hay usuarios');

      return users;
    } catch (error: any) {
      if (error instanceof Error) {
        Errors.NError(error.message);
      } else {
        Errors.NError('Unknown error', 500);
      }
    }
  }

  //? SE NECESITAN LOS ROLES PARA DAR ACCEESO A ESTE METODO
  // async findAllSortedByUpdate(order: 'ASC' | 'DESC'): Promise<User[]> {
  //   const users = await this.userRepository.find({
  //     order: { updated_at: order },
  //   });

  //   if (!users || users.length === 0)
  //     throw new NotFoundException('No hay usuarios');

  //   return users;
  // }

  //? SE NECESITAN LOS ROLES PARA DAR ACCEESO A ESTE METODO
  // async findOnlineUsers(): Promise<User[]> {
  //   const users = await this.userRepository.find({
  //     where: { online: true },
  //   });

  //   if (!users || users.length === 0)
  //     throw new NotFoundException('No hay usuarios');

  //   return users;
  // }

  //? SE NECESITAN LOS ROLES PARA DAR ACCEESO A ESTE METODO
  // async findByRole(role: UserRole): Promise<User[]> {
  //   const users = await this.userRepository.find({
  //     where: { rol: role },
  //   });

  //   if (!users.length) {
  //     throw new NotFoundException(
  //       `No se encontraron usuarios con el rol: ${role}`,
  //     );
  //   }

  //   return users;
  // }

  // busca un usuario

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
      select: [
        'id',
        'username',
        'email',
        'email_recuperacion',
        'online',
        'rol',
        'created_at',
        'updated_at',
        'password',
      ],
    });

    if (!user || user === null)
      throw new NotFoundException('El usuario no existe');

    return user;
  }

  // busca un usuario
  async findOneByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        username: username,
      },
    });

    if (!user || user === null)
      throw new NotFoundException('El usuario no existe');

    return user;
  }
  // busca un usuario
  async findOneById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!user || user === null)
      throw new NotFoundException('El usuario no existe');

    return user;
  }

  // retorna el usuario que ha iniciado
  async login(loginUserDto: LoginUserDto) {
    try {
      const user = await this.findOneByUsername(loginUserDto.username);
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
      return userWithoutPassword;
    } catch (error: any) {
      throw new RpcException({
        message: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 400,
      });
    }
  }

  // async findDeletedUsers(): Promise<User[]> {
  //   const users = await this.userRepository.find({
  //     where: { deleted_at: Not(IsNull()) }, // Filtra usuarios eliminados
  //   });

  //   if (!users || users.length === 0) {
  //     throw new NotFoundException('No hay usuarios eliminados');
  //   }

  //   return users;
  // }

  async updateUserSameUser(udpateUserDto: UpdateUserDto): Promise<boolean> {
    if (!udpateUserDto.id) {
      throw new BadRequestException('Id is required');
    }

    const user = await this.findOneById(Number(udpateUserDto.id));

    if (!user || user === null)
      throw new NotFoundException(`El usuario no existe`);

    Object.assign(user, udpateUserDto);

    this.logger.log(`user ${user.id} has been updated`);

    return (await this.userRepository.save(user)) ? true : false;
  }

  // actualiza el estado online
  async updateOnlineStatus(user: UserWithoutPassword) {
    if (!user) {
      throw new NotFoundException(`No se encontró el usuario con ID`);
    }

    const user_online = !user.online;
    user.online = user_online;
    const user_updated = await this.userRepository.save(user);
    return user_updated;
  }

  async deleteOne(id: number) {
    const result = await this.userRepository.update(id, {
      deleted_at: new Date(), // Seteamos la fecha actual para "deleted_at"
    });
    if (!result || result === null)
      throw new NotFoundException(`El usuario no existe`);

    return 'ok';
  }
}
