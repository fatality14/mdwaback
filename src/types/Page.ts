import { ObjectType, Field, InputType, ID } from "type-graphql"
import { Part, PartDataInput } from "./Part"

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
    @Field(type => [PartDataInput])
    parts!: PartDataInput[]
    @Field()
    name!: string
}

@InputType()
export class PageChangeInput {
    @Field(type => [PartDataInput])
    parts!: PartDataInput[]
    @Field()
    name!: string
}