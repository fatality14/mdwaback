import { ObjectType, Field, ID, InputType } from "type-graphql"
import { IRightsAssignable } from "./IRightsAssignable"

@ObjectType()
export class User extends IRightsAssignable{
    @Field(() => ID)
    id!: number
    @Field()
    csrf!: string
    @Field()
    auth!: string
    @Field()
    rights!: string
}

@InputType()
export class UserLoginInput {
    @Field({nullable: true})
    csrf?: string
    @Field({nullable: true})
    auth!: string
}

@InputType()
export class UserInput {
    @Field()
    rights!: string
}