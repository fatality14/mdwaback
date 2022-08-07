import { ObjectType, Field, ID, InputType } from "type-graphql"
import { Page } from "./Page"

@ObjectType()
export class PageList{
    @Field(() => ID)
    id!: number
    @Field(type => [Page])
    pages!: Page[]
    @Field()
    rights!: string
    @Field(type => [String])
    usersAllowed!: string[]
}

@InputType()
export class PageListInput {
    @Field()
    rights!: string
    @Field(type => [String])
    usersAllowed!: string[]
}