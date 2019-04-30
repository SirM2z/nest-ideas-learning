import {
  Resolver,
  Query,
  Args,
  ResolveProperty,
  Parent,
  Mutation,
  Context,
} from '@nestjs/graphql';
import { IdeaService } from './idea.service';
import { CommentService } from '../comment/comment.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../shared/auth.guard';
import { IdeaDTO } from './idea.dto';

@Resolver('Idea')
export class IdeaResolver {
  constructor(
    private ideaService: IdeaService,
    private commentService: CommentService,
  ) {}

  @Query()
  ideas(
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
    @Args('newest') newest: boolean,
  ) {
    return this.ideaService.showAll(page, pageSize, newest);
  }

  @Query()
  idea(@Args('id') id: string) {
    return this.ideaService.read(id);
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  createIdea(
    @Args('idea') idea: string,
    @Args('description') description: string,
    @Context('user') user,
  ) {
    const { id: userId } = user;
    const data: IdeaDTO = { idea, description };
    return this.ideaService.create(userId, data);
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  updateIdea(
    @Args('id') ideaId: string,
    @Args('idea') idea: string,
    @Args('description') description: string,
    @Context('user') user,
  ) {
    const { id: userId } = user;
    const data: IdeaDTO = { idea, description };
    return this.ideaService.update(ideaId, userId, data);
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  deleteIdea(@Args('id') ideaId: string, @Context('user') user) {
    const { id: userId } = user;
    return this.ideaService.destroy(ideaId, userId);
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  upvote(@Args('id') ideaId: string, @Context('user') user) {
    const { id: userId } = user;
    return this.ideaService.upvote(ideaId, userId);
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  downvote(@Args('id') ideaId: string, @Context('user') user) {
    const { id: userId } = user;
    return this.ideaService.downvote(ideaId, userId);
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  bookmark(@Args('id') ideaId: string, @Context('user') user) {
    const { id: userId } = user;
    return this.ideaService.bookmark(ideaId, userId);
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  unbookmark(@Args('id') ideaId: string, @Context('user') user) {
    const { id: userId } = user;
    return this.ideaService.unbookmark(ideaId, userId);
  }

  @ResolveProperty()
  comments(@Parent() idea) {
    const { id } = idea;
    return this.commentService.showByIdea(id);
  }
}
