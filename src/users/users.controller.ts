import { Controller, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

@Controller()
export class UsersController {
  constructor(private readonly UsersService: UserService) {}

  @MessagePattern('createUser')
  create(
    @Payload(new ValidationPipe()) createUserDto: CreateUserDto,
  ): Promise<boolean> {
    return this.UsersService.createUser(createUserDto);
  }

  // @MessagePattern('tests')
  // prove(): string {
  //   return this.UsersService.test();
  // }

  @MessagePattern({ cmd: 'findAllUsers' })
  async findAllUsers({
    skip,
    limit,
    order,
  }: {
    skip: number;
    limit: number;
    order: 'ASC' | 'DESC';
  }) {
    return await this.UsersService.findAllUsersPages(skip, limit, order);
  }

  @MessagePattern({ cmd: 'findAll' })
  async findAll() {
    return await this.UsersService.findAllUsers();
  }

  // @MessagePattern({ cmd: 'findAllSortedByCreation' })
  // async findAllSortedByCreation(@Payload() order: 'ASC' | 'DESC') {
  //   return await this.UsersService.findAllSortedByCreation(order);
  // }

  // @MessagePattern({ cmd: 'findAllSortedByUpdate' })
  // async findAllSortedByUpdate(@Payload() order: 'ASC' | 'DESC') {
  //   return await this.UsersService.findAllSortedByUpdate(order);
  // }

  @MessagePattern({ cmd: 'findOnlineUsers' })
  async findOnlineUsers() {
    return await this.UsersService.findOnlineUsers();
  }

  @MessagePattern({ cmd: 'findUsersByRole' })
  async findUsersByRole(@Payload() role: UserRole) {
    return await this.UsersService.findByRole(role);
  }

  @MessagePattern('login')
  async findOne(@Payload() loginUserDto: LoginUserDto) {
    const user = await this.UsersService.login(loginUserDto);
    const userWithPassword = { ...user, password: 'defaultPassword' }; // Ensure password is included
    await this.UsersService.updateOnlineStatus(userWithPassword);
    return user;
  }

  // @MessagePattern({ cmd: 'findDeletedUsers' })
  // async findDeletedUsers() {
  //   return await this.UsersService.findDeletedUsers();
  // }

  @MessagePattern('updateUser')
  update(@Payload() updateUserDto: UpdateUserDto) {
    return this.UsersService.updateUserSameUser(updateUserDto);
  }

  // @MessagePattern({ cmd: 'updateOnlineStatus' })
  // async updateOnlineStatus(@Payload() data: { id: string; status: boolean }) {
  //   return await this.UsersService.updateOnlineStatus(data.id, data.status);
  // }

  @MessagePattern('removeUser')
  remove(@Payload() id: number) {
    return this.UsersService.deleteOne(id);
  }
}
