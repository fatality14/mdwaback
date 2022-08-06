import { ObjectType, Field, InputType, Resolver, Query, Arg, Mutation, ID } from "type-graphql"
import { User, UserInput } from "../types/User"
import userList from "../data/UserData"
import { checkIsUserAllowed as checkIsUserHasRights } from "../utility/UserUtils";
import ERights from "../utility/ERights";
import errors from "../errors/CommonErr";
import { enumToStrArr, toEnumVal } from "../utility/EnumUtils";

@Resolver(() => User)
export class UsersResolver {
    private items: User[] = userList.items;

    @Query(() => [User])
    async getUsers(@Arg("uid") uid: number): Promise<User[]> {
        if (checkIsUserHasRights(uid, ERights.ADMIN, this.items)) {
            return this.items
        }
        else {
            throw errors.notAllowedErr;
        }
    }

    @Query(() => User)
    async getUser(@Arg("uid") uid: number, @Arg("reqId") reqId: number): Promise<User | undefined> {
        if (uid == reqId || checkIsUserHasRights(uid, ERights.ADMIN, this.items)) {
            const user = this.items.find(u => u.id === reqId)
            return user
        }
        else {
            throw errors.notAllowedErr;
        }
    }

    @Mutation(() => User)
    async createUser(
        @Arg("uid") uid: number,
        @Arg("input", { nullable: true }) input?: UserInput
    ): Promise<User> {
        const user : User = {
            id: this.items.length + 1,
            rights: 'ANON',
            crtf: 111
        }

        if (input) {
            if (
                checkIsUserHasRights(uid, ERights.REGISTERED, this.items) ||
                checkIsUserHasRights(uid, ERights.ANON, this.items)
            ) {
                if (toEnumVal(input.rights, ERights) == ERights.ADMIN) {
                    throw errors.notAllowedErr;
                }
            }
            else{
                user.rights = input.rights;
            }
        }

        this.items.push(user)
        return user
    }

    // @Mutation(() => User)
    // async updateUser(
    //     @Arg("uid") uid: number,
    //     @Arg("input") input: UserInput
    // ): Promise<User> {
    //     const user = this.items.find(u => u.id === uid)

    //     if (!user) {
    //         throw new Error("User not found")
    //     }

    //     const updatedUser = {
    //         ...user,
    //         ...input,
    //     }

    //     this.items = this.items.map(u => (u.id === uid ? updatedUser : u))

    //     return updatedUser
    // }
}