import {
  Resolver,
  Query,
  Args,
  Parent,
  ResolveProperty,
} from '@nestjs/graphql';
import { UserService } from './user.service';
import { CommentService } from '../comment/comment.service';

@Resolver('User')
export class UserResolver {
  constructor(
    private userService: UserService,
    private commentService: CommentService,
  ) {}

  @Query()
  users(@Args('page') page: number, @Args('pageSize') pageSize: number) {
    return this.userService.showAll(page, pageSize);
  }

  @ResolveProperty()
  comments(@Parent() user) {
    const { id } = user;
    return this.commentService.showByUser(id);
  }
}
