import { ObjectType, Field, ID, InputType } from "type-graphql"
import { IRightsAssignable } from "./IRightAssignable"
import { Page } from "./Page"

@ObjectType()
export class PageList extends IRightsAssignable{
    @Field(() => ID)
    id!: number
    @Field(type => [Page])
    pages!: Page[]
    @Field()
    rights!: string
}

@InputType()
export class PageListInput {
    @Field()
    rights!: string
}