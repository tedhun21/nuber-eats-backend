import { ArgsType, Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@ArgsType()
export class DeleteDishInput {
  @Field((type) => Int)
  dishId: number;
}

@ObjectType()
export class DeleteDishOutput extends CoreOutput{}