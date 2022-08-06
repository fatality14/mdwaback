import { ObjectType, Field, ID, InputType } from "type-graphql"
import { IRightsAssignable } from "./IRightsAssignable"
import { Page } from "./Page"

@ObjectType()
export class PageList extends IRightsAssignable{
    @Field(() => ID)
    id!: number
    @Field(type => [Page])
    pages!: Page[]
    @Field()
    rights!: string //TODO must be array type
}

@InputType()
export class PageListInput {
    @Field()
    rights!: string
}