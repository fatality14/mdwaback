import { ObjectType, Field, InputType, ID } from "type-graphql"
import { Part, PartInput } from "./Part"

@ObjectType()
export class Page {
    @Field(() => ID)
    id!: number
    @Field(type => [Part])
    parts!: Part[]
}

@InputType()
export class PageInput {
    @Field(type => [PartInput])
    parts!: PartInput[]
}