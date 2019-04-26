import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from './user.entity';
import { UserDTO, UserRo } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRespository: Repository<UserEntity>,
  ) {}

  async showAll(page: number = 1, pageSize: number = 10): Promise<UserRo[]> {
    const users = await this.userRespository.find({
      relations: ['ideas', 'bookmarks'],
      take: pageSize,
      skip: pageSize * (page - 1),
    });
    return users.map(user => user.toResponseObject(false));
  }

  async read(username: string) {
    const user = await this.userRespository.findOne({
      where: { username },
      relations: ['ideas', 'bookmarks'],
    });
    return user.toResponseObject(false);
  }

  async login(data: UserDTO): Promise<UserRo> {
    const { username, password } = data;
    const user = await this.userRespository.findOne({ where: { username } });
    if (!user || !(await user.comparePassword(password))) {
      throw new HttpException(
        'Invalid username/password',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user.toResponseObject();
  }

  async register(data: UserDTO): Promise<UserRo> {
    const { username, password } = data;
    let user = await this.userRespository.findOne({ where: { username } });
    if (user) {
      throw new HttpException('User alerady exists', HttpStatus.BAD_REQUEST);
    }
    user = await this.userRespository.create(data);
    await this.userRespository.save(user);
    return user.toResponseObject();
  }
}
