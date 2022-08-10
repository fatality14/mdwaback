import { Field, ID } from "type-graphql";

export default class HasId{
    @Field(() => ID)
    id!: number
}