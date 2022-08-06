import { ObjectType, Field, ID, InputType } from "type-graphql"
import { IRightsAssignable } from "./IRightAssignable"

@ObjectType()
export class User extends IRightsAssignable{
    @Field(() => ID)
    id!: number
    @Field()
    crtf!: number
    @Field()
    rights!: string
}

@InputType()
export class UserInput {
    @Field()
    rights!: string
}