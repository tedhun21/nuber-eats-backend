import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class RestaurantResolver {
  @Query(() => Boolean)
  isPizzaGood(): Boolean {
    return true;
  }
}
