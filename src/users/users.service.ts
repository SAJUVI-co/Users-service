import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { User, UserOnline, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidateUserExist } from './dto/search.dto';

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
    const user_username = await this.findOne(validateUserExist.username);

    if (user_email) return true;
    if (user_username) return true;
    return false;
  }

  // Crea al usuario
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // const userExist = this.findOne(createUserDto.username);

    const hashedPassword = await argon2.hash(createUserDto.password);
    console.log(hashedPassword);

    const user: User = this.userRepository.create({
      ...createUserDto,
      email_recuperacion: createUserDto.email_recuperacion
        ? createUserDto.email_recuperacion
        : createUserDto.email,
      password: hashedPassword,
      rol: UserRole.INVITE, // Rol por defecto
      online: UserOnline.OFFLINE, // Estado por defecto
    });

    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();

    if (!users || users.length === 0)
      throw new NotFoundException('No hay usuarios');
    return users;
  }

  async findAllSortedByCreation(order: 'ASC' | 'DESC'): Promise<User[]> {
    const users = await this.userRepository.find({
      order: { created_at: order },
    });

    if (!users || users.length === 0)
      throw new NotFoundException('No hay usuarios');

    return users;
  }

  async findAllSortedByUpdate(order: 'ASC' | 'DESC'): Promise<User[]> {
    const users = await this.userRepository.find({
      order: { updated_at: order },
    });

    if (!users || users.length === 0)
      throw new NotFoundException('No hay usuarios');

    return users;
  }

  async findOnlineUsers(): Promise<User[]> {
    const users = await this.userRepository.find({
      where: { online: UserOnline.ONLINE },
    });

    if (!users || users.length === 0)
      throw new NotFoundException('No hay usuarios');

    return users;
  }

  async findByRole(role: UserRole): Promise<User[]> {
    const users = await this.userRepository.find({
      where: { rol: role },
    });

    if (!users.length) {
      throw new NotFoundException(
        `No se encontraron usuarios con el rol: ${role}`,
      );
    }

    return users;
  }

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
  async findOne(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        username: username,
      },
    });

    if (!user || user === null)
      throw new NotFoundException('El usuario no existe');

    return user;
  }

  // retorna el usuario que ha iniciado
  async login(username: string, password: string): Promise<User> {
    const user = await this.findOne(username);

    const compare_password = await argon2.verify(user.password, password);

    if (!compare_password) throw new BadRequestException('Invalid Credentials');

    return user;
  }

  async findDeletedUsers(): Promise<User[]> {
    const users = await this.userRepository.find({
      where: { deleted_at: Not(IsNull()) }, // Filtra usuarios eliminados
    });

    if (!users || users.length === 0) {
      throw new NotFoundException('No hay usuarios eliminados');
    }

    return users;
  }

  async updateUser(udpateUserDto: UpdateUserDto): Promise<User> {
    const user: UpdateUserDto | null = await this.userRepository.findOne({
      where: {
        username: udpateUserDto.username,
      },
    });

    if (!user || user === null)
      throw new NotFoundException(`El usuario no existe`);

    Object.assign(user, udpateUserDto);

    this.logger.log(
      `The user ${udpateUserDto.id} has been updated\n${JSON.stringify(user)}`,
    );

    return await this.userRepository.save(user);
  }

  // actualiza el estado online
  async updateOnlineStatus(userId: number, status: boolean): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`No se encontró el usuario con ID ${userId}`);
    }

    user.online = status ? UserOnline.ONLINE : UserOnline.OFFLINE;
    await this.userRepository.save(user);

    return `El estado online del usuario ${userId} ha sido actualizado a ${status}`;
  }

  async deleteOne(id: number): Promise<void> {
    const result = await this.userRepository.update(id, {
      deleted_at: new Date(), // Seteamos la fecha actual para "deleted_at"
    });

    if (!result || result === null)
      throw new NotFoundException(`El usuario no existe`);

    this.logger.log(`The user ${id} has been deleted`);
  }
}
