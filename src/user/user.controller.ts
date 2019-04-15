import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDTO } from './user.dto';
import { ValidationPipe } from '../shared/validation.pipe';
import { AuthGuard } from '../shared/auth.guard';
import { User } from './user.decorator';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('api/user')
  @UseGuards(new AuthGuard())
  showAllUsers(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    // console.log(user);
    return this.userService.showAll(page, pageSize);
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  logig(@Body() data: UserDTO) {
    return this.userService.login(data);
  }

  @Post('register')
  @UsePipes(new ValidationPipe())
  register(@Body() data: UserDTO) {
    return this.userService.register(data);
  }
}
