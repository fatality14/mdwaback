import { ObjectType, Field, ID, InputType } from "type-graphql"
import ERights from "../enums/ERights"
import HasId from "./interfaces/HasId"
import HasRights from "./interfaces/HasRights"
import { Page } from "./Page"

@ObjectType()
export class PageListData implements HasRights{
    @Field(type => [Page])
    pages!: Page[]
    @Field(type => [String])
    usersAllowed!: string[]
    @Field(() => ERights)
    rights!: ERights
}

@ObjectType()
export class PageList implements HasId{
    @Field(() => ID)
    id!: number
    @Field(type => PageListData)
    data!: PageListData
}

@InputType()
export class PageListInput implements HasRights {
    @Field(() => ERights)
    rights!: ERights
    @Field(type => [String])
    usersAllowed!: string[]
}