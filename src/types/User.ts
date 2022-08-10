import { ObjectType, Field, ID, InputType } from "type-graphql"
import ERights from "../enums/ERights"
import HasId from "./interfaces/HasId"
import { HasLoginPass } from "./interfaces/HasLoginPass"
import HasRights from "./interfaces/HasRights"

@ObjectType()
export class UserData implements HasRights, HasLoginPass{
    @Field(() => ERights)
    rights!: ERights
    @Field()
    csrf!: string
    @Field()
    login!: string
    @Field()
    password!: string
}

@ObjectType()
export class User implements HasId{
    @Field(() => ID)
    id!: number
    @Field(() => UserData)
    data!: UserData
}

@InputType()
export class UserAuthInput implements HasLoginPass{
    @Field({nullable: true})
    csrf?: string
    @Field({nullable: true})
    login?: string
    @Field({nullable: true})
    password?: string
}


@InputType()
export class UserRightsInput implements HasRights{
    @Field(() => ERights)
    rights!: ERights
}

@InputType()
export class UserChangeInput implements HasLoginPass, HasRights{
    @Field(() => ERights, {nullable: true})
    rights?: ERights
    @Field({nullable: true})
    login?: string
    @Field({nullable: true})
    password?: string
}
