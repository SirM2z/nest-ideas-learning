import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IdeaEntity } from './idea.entity';
import { IdeaDTO, IdeaRO } from './idea.dto';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  private toResponseObject(idea: IdeaEntity): IdeaRO {
    const responseObject: any = {
      ...idea,
      author: idea.author.toResponseObject(false),
    };
    if (responseObject.upvotes) {
      responseObject.upvotes = responseObject.upvotes.length;
    }
    if (responseObject.downvotes) {
      responseObject.downvotes = responseObject.downvotes.length;
    }
    return responseObject;
  }

  private ensureOwnership(idea: IdeaEntity, userId: string) {
    if (idea.author.id !== userId) {
      throw new HttpException('Incorrect user', HttpStatus.UNAUTHORIZED);
    }
  }

  async showAll(): Promise<IdeaRO[]> {
    const ideas = await this.ideaRepository.find({
      relations: ['author', 'upvotes', 'downvotes'],
    });
    return ideas.map(idea => this.toResponseObject(idea));
  }

  async create(userId: string, data: IdeaDTO): Promise<IdeaRO> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const idea = await this.ideaRepository.create({ ...data, author: user });
    await this.ideaRepository.save(idea);
    return this.toResponseObject(idea);
  }

  async read(id: string): Promise<IdeaRO> {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!idea) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return this.toResponseObject(idea);
  }

  async update(
    id: string,
    userId: string,
    data: Partial<IdeaDTO>,
  ): Promise<IdeaRO> {
    let idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!idea) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    this.ensureOwnership(idea, userId);
    await this.ideaRepository.update({ id }, data);
    idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    return this.toResponseObject(idea);
  }

  async destroy(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!idea) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    this.ensureOwnership(idea, userId);
    await this.ideaRepository.delete({ id });
    return { code: 1, message: '删除成功' };
  }

  async upvote(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (idea.upvotes.some(upvote => upvote.id === userId)) {
      throw new HttpException('You have upvoted', HttpStatus.BAD_REQUEST);
    } else {
      idea.upvotes.push(user);
      await this.ideaRepository.save(idea);
    }

    return idea;
  }

  async downvote(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['downvote'],
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (idea.downvotes.some(upvote => upvote.id === userId)) {
      throw new HttpException('You have downvoted', HttpStatus.BAD_REQUEST);
    } else {
      idea.downvotes.push(user);
      await this.ideaRepository.save(idea);
    }

    return idea;
  }

  async bookmark(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({ where: { id } });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bookmarks'],
    });

    if (user.bookmarks.some(bookmark => bookmark.id === idea.id)) {
      throw new HttpException(
        'Idea already bookmarked',
        HttpStatus.BAD_REQUEST,
      );
    } else {
      user.bookmarks.push(idea);
      await this.userRepository.save(user);
    }

    return user.toResponseObject(false);
  }

  async unbookmark(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({ where: { id } });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bookmarks'],
    });

    let bookmarkIndex = -1;
    if (
      user.bookmarks.some((bookmark, index) => {
        bookmarkIndex = index;
        return bookmark.id === idea.id;
      })
    ) {
      user.bookmarks.splice(bookmarkIndex, 1);
      await this.userRepository.save(user);
    } else {
      throw new HttpException('Idea dont bookmarked', HttpStatus.BAD_REQUEST);
    }

    return user.toResponseObject(false);
  }
}
