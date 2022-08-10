import { Field } from "type-graphql"

export class HasLoginPass{
    @Field({nullable: true})
    login?: string
    @Field({nullable: true})
    password?: string
}