import { Field, ID } from "type-graphql";
import ERights from "../../enums/ERights";

export default class HasRights{
    @Field(() => ERights, {nullable: true})
    rights?: ERights
}