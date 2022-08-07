import { ObjectType, Field, ID, InputType } from "type-graphql"

@ObjectType()
export class Part {
    @Field(() => ID)
    id!: number
    @Field()
    type!: number
    @Field(type => String)
    data!: string
}

@InputType()
export class PartInput {
    @Field()
    type!: number
    @Field(type => String)
    data!: string
}