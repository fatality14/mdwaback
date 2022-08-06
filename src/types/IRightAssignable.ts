import { ObjectType, Field, ID } from "type-graphql"

@ObjectType()
export class IRightsAssignable {
    @Field(() => ID)
    id!: number
    @Field()
    rights!: string
}