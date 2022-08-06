import { ObjectType, Field, ID, InputType } from "type-graphql"

@ObjectType()
export class Part {
    @Field(() => ID)
    id!: number
    @Field()
    isCode!: boolean
    @Field(type => String)
    data!: string
}

@InputType()
export class PartInput {
    @Field()
    isCode!: boolean
    @Field(type => String)
    data!: string
}