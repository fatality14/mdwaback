import { ObjectType, Field, InputType, Resolver, Query, Arg, Mutation, ID } from "type-graphql"
import { User, UserLoginInput, UserInput } from "../types/User"
import userList from "../data/UserData"
import { authentificateUser, checkRights, checkConcreteRights, getUserByLogin, authentificateConcreteUser } from "../utility/UserUtils";
import ERights from "../utility/ERights";
import errors from "../errors/CommonErr";
import { enumToStrArr, hasEnumValue, toEnumVal } from "../utility/EnumUtils";

@Resolver(() => User)
export class UsersResolver {
    private users: User[] = userList.items;

    @Query(() => [User])
    async getUsers(@Arg("login") login: UserLoginInput): Promise<User[]> {
        const client = getUserByLogin(this.users, login);
        if (!client) {
            throw errors.noSuchUser;
        }

        if (checkConcreteRights(client, ERights.ADMIN)) {
            return this.users
        }
        else {
            throw errors.notAllowedErr;
        }
    }

    @Query(() => User)
    async getUserData(@Arg("login") login: UserLoginInput): Promise<User | undefined> {
        const client = getUserByLogin(this.users, login);
        if (!client) {
            throw errors.noSuchUser;
        }

        return client;
    }

    @Mutation(() => User)
    async createAnon(): Promise<User> {
        const user: User = {
            id: this.users.length + 1,
            rights: ERights.ANON,
            csrf: '',
            auth: ''
        }

        user.auth = 'auth' + user.id; //TODO replace later
        this.users.push(user)

        authentificateConcreteUser(user, user.auth)

        return user
    }

    @Mutation(() => User)
    async createUser(
        @Arg("login") login: UserLoginInput,
        @Arg("nick") nick: string,
        @Arg("pass") pass: string,
        @Arg("userIn") userIn: UserInput
    ): Promise<User> {
        if (!hasEnumValue(userIn.rights, ERights)) {
            throw errors.noSuchRights
        }

        const client = getUserByLogin(this.users, login);
        if (!client) {
            throw errors.noSuchUser;
        }

        const authToken = nick + ' ' + pass;

        if(this.users.find(i => i.auth.split(" ")[0] == nick)){
            throw errors.alreadyExists;
        }

        if (checkConcreteRights(client, ERights.ANON)) {
            if (userIn.rights == ERights.ADMIN ||
                userIn.rights == ERights.ANON) {
                throw errors.notAllowedErr;
            }

            client.auth = authToken;
            client.rights = userIn.rights;
            return client
        }

        let newUser: User = {
            id: this.users.length + 1,
            rights: ERights.REGISTERED,
            csrf: '',
            auth: authToken
        }

        if (checkConcreteRights(client, ERights.REGISTERED)) {
            if (userIn.rights == ERights.ADMIN) {
                throw errors.notAllowedErr;
            }
        }
        else{
            client.rights = userIn.rights;
        }

        authentificateConcreteUser(newUser, newUser.auth);
        this.users.push(newUser);

        return newUser
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