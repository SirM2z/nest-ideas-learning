import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Body,
  UsePipes,
  Delete,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from '../shared/auth.guard';
import { CommentDTO } from './comment.dto';
import { User } from '../user/user.decorator';
import { ValidationPipe } from '../shared/validation.pipe';

@Controller('api/comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get('idea/:id')
  showCommentsByIdea(
    @Param('id') idea: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.commentService.showByIdea(idea, page, pageSize);
  }

  @Get('user/:id')
  showCommentsByUser(
    @Param('id') user: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.commentService.showByUser(user, page, pageSize);
  }

  @Post('idea/:id')
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  createComment(
    @Param('id') idea: string,
    @Body() data: CommentDTO,
    @User('id') user: string,
  ) {
    return this.commentService.create(idea, user, data);
  }

  @Get(':id')
  showComment(@Param('id') id: string) {
    return this.commentService.show(id);
  }

  @Delete(':id')
  @UseGuards(new AuthGuard())
  destroyComment(@Param('id') id: string, @User('id') user: string) {
    return this.commentService.destroy(id, user);
  }
}
