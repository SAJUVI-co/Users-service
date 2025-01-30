import { Controller, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/user.entity';
// import { UpdateUserDto } from './dto/update-user.dto';

@Controller()
export class UsersController {
  constructor(private readonly UsersService: UserService) {}

  @MessagePattern('createUser')
  create(@Payload(new ValidationPipe()) createUserDto: CreateUserDto) {
    return this.UsersService.createUser(createUserDto);
  }

  @MessagePattern({ cmd: 'findAllUsers' })
  async findAllUsers() {
    return await this.UsersService.findAll();
  }

  @MessagePattern({ cmd: 'findAllSortedByCreation' })
  async findAllSortedByCreation(@Payload() order: 'ASC' | 'DESC') {
    return await this.UsersService.findAllSortedByCreation(order);
  }

  @MessagePattern({ cmd: 'findAllSortedByUpdate' })
  async findAllSortedByUpdate(@Payload() order: 'ASC' | 'DESC') {
    return await this.UsersService.findAllSortedByUpdate(order);
  }

  @MessagePattern({ cmd: 'findOnlineUsers' })
  async findOnlineUsers() {
    return await this.UsersService.findOnlineUsers();
  }

  @MessagePattern({ cmd: 'findUsersByRole' })
  async findUsersByRole(@Payload() role: UserRole) {
    return await this.UsersService.findByRole(role);
  }

  @MessagePattern('findOneUser')
  findOne(@Payload() username: string, password: string) {
    return this.UsersService.login(username, password);
  }

  @MessagePattern({ cmd: 'findDeletedUsers' })
  async findDeletedUsers() {
    return await this.UsersService.findDeletedUsers();
  }

  @MessagePattern('updateUser')
  update(@Payload() updateUserDto: UpdateUserDto) {
    return this.UsersService.updateUser(updateUserDto);
  }

  @MessagePattern({ cmd: 'updateOnlineStatus' })
  async updateOnlineStatus(
    @Payload() data: { userId: number; status: boolean },
  ) {
    return await this.UsersService.updateOnlineStatus(data.userId, data.status);
  }

  @MessagePattern('removeUser')
  remove(@Payload() id: number) {
    return this.UsersService.deleteOne(id);
  }
}
