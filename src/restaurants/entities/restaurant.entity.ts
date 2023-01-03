import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class Restaurant {
  @Field(type => String)
  name: string;

  @Field(type => Boolean)
  isVegan?: boolean;

  @Field(type => String)
  adress: string;

  @Field(type=>String)
  ownerName: string;
}
