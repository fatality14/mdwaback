import { ObjectType, Field, ID, InputType } from "type-graphql"
import HasId from "./interfaces/HasId"
import EPagePartType from "../enums/EPagePartType"

@ObjectType()
export class PartData{
    @Field(() => EPagePartType)
    type!: EPagePartType
    @Field(type => String)
    content!: string
}

@ObjectType()
export class Part implements HasId {
    @Field(() => ID)
    id!: number
    @Field(type => PartData)
    data!: PartData
}

@InputType()
export class PartInput {
    @Field(() => EPagePartType)
    type!: EPagePartType
    @Field(type => String)
    content!: string
}