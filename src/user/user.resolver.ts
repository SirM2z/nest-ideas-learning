import {
  Resolver,
  Query,
  Args,
  Parent,
  ResolveProperty,
  Mutation,
} from '@nestjs/graphql';
import { UserService } from './user.service';
import { CommentService } from '../comment/comment.service';
import { UserDTO } from './user.dto';

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

  @Mutation()
  login(
    @Args('username') username: string,
    @Args('password') password: string,
  ) {
    const user: UserDTO = { username, password };
    return this.userService.login(user);
  }

  @Mutation()
  register(
    @Args('username') username: string,
    @Args('password') password: string,
  ) {
    const user: UserDTO = { username, password };
    return this.userService.register(user);
  }

  @ResolveProperty()
  comments(@Parent() user) {
    const { id } = user;
    return this.commentService.showByUser(id);
  }
}
