import { ObjectType, Field, InputType, ID } from "type-graphql"
import { Part, PartInput } from "./Part"

@ObjectType()
export class PageData {
    @Field(type => [Part])
    parts!: Part[]
    @Field()
    name!: string
}

@ObjectType()
export class Page {
    @Field(() => ID)
    id!: number
    @Field(type => PageData)
    data!: PageData
}

@InputType()
export class PageInput {
    @Field(type => [PartInput])
    parts!: PartInput[]
    @Field()
    name!: string
}