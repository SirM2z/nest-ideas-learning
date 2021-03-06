import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from './comment.entity';
import { UserEntity } from '../user/user.entity';
import { IdeaEntity } from '../idea/idea.entity';
import { CommentDTO } from './comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
  ) {}

  private toResponseObject(comment: CommentEntity) {
    const responseObject: any = comment;
    if (responseObject.author) {
      responseObject.author = responseObject.author.toResponseObject(false);
    }
    return responseObject;
  }

  async showByIdea(id: string, page: number = 1, pageSize: number = 10) {
    const comments = await this.commentRepository.find({
      where: { idea: { id } },
      relations: ['author'],
      take: pageSize,
      skip: pageSize * (page - 1),
    });
    return comments.map(comment => this.toResponseObject(comment));
  }

  async showByUser(id: string, page: number = 1, pageSize: number = 10) {
    const comments = await this.commentRepository.find({
      where: { author: { id } },
      relations: ['author'],
      take: pageSize,
      skip: pageSize * (page - 1),
    });
    return comments.map(comment => this.toResponseObject(comment));
  }

  async show(id: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'idea'],
    });
    return this.toResponseObject(comment);
  }

  async create(ideaId: string, userId: string, data: CommentDTO) {
    const idea = await this.ideaRepository.findOne({ where: { id: ideaId } });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const comment = await this.commentRepository.create({
      ...data,
      author: user,
      idea,
    });
    await this.commentRepository.save(comment);
    return this.toResponseObject(comment);
  }

  async destroy(id: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'idea'],
    });
    if (comment.author.id !== userId) {
      throw new HttpException(
        'You do not own this comment ',
        HttpStatus.UNAUTHORIZED,
      );
    }
    await this.commentRepository.remove(comment);
    return { code: 1, msg: '删除成功' };
  }
}
