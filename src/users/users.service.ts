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
import { ValidateUserExist } from './dto/search.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UserService {
  private readonly logger = new Logger('UserService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  test(): string {
    return 'hello users service';
  }

  async userExist(validateUserExist: ValidateUserExist): Promise<boolean> {
    const user_email = await this.findOneByEmail(validateUserExist.email);
    const user_username = await this.findOneByUsername(
      validateUserExist.username,
    );

    if (user_email) return true;
    if (user_username) return true;
    return false;
  }

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
        // console.log()
        throw new RpcException({
          message: 'No users found',
          statusCode: 404,
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = savedUser;
      return {
        access: true,
        message: userWithoutPassword,
      };
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Internal Server Error',
        statusCode: 401,
      });
    }
  }

  //? SE NECESITAN LOS ROLES PARA DAR ACCEESO A ESTE METODO
  //! CHECK
  async findAllUsersPages(
    skip = 0,
    limit = 10,
    order: 'ASC' | 'DESC',
  ): Promise<{
    users: (UserWithoutPassword & { sequentialId: number })[];
    total: number;
  }> {
    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      order: { id: order },
    });

    if (!users || users.length === 0) {
      throw new NotFoundException('No hay usuarios');
    }

    const sequentialUsers = users.map((user, index) => ({
      ...user,
      password: undefined, // Eliminar el campo password
      sequentialId: skip + index + 1, // Generar IDs secuenciales
    }));

    return {
      users: sequentialUsers,
      total,
    };
  }

  async findAllUsers() {
    return await this.userRepository.find({});
  }

  //? SE NECESITAN LOS ROLES PARA DAR ACCEESO A ESTE METODO
  // async findAllSortedByCreation(order: 'ASC' | 'DESC'): Promise<User[]> {
  //   const users = await this.userRepository.find({
  //     order: { created_at: order },
  //   });

  //   if (!users || users.length === 0)
  //     throw new NotFoundException('No hay usuarios');

  //   return users;
  // }

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
    const user = await this.findOneByUsername(loginUserDto.username);
    const compare_password = await argon2.verify(
      user.password,
      loginUserDto.password,
    );

    if (!compare_password) throw new BadRequestException('Invalid Credentials');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
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
