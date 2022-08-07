import { ObjectType, Field, InputType, Resolver, Query, Arg, Mutation, ID } from "type-graphql"
import { User, UserLoginInput, UserInput } from "../types/User"
import userList from "../data/UserData"
import { genUserCSRF, checkRights, checkConcreteRights, getUserByLogin, genConcreteUserCSRF } from "../utility/UserUtils";
import ERights from "../utility/ERights";
import errors from "../errors/CommonErr";
import { enumToStrArr, hasEnumValue, toEnumVal } from "../utility/EnumUtils";

@Resolver(() => User)
export class UsersResolver {
    private users: User[] = userList.items;

    @Query(() => [User])
    async getUsers(@Arg("login") login: UserLoginInput): Promise<User[]> {
        //get client
        const client = getUserByLogin(this.users, login);
        if (!client) {
            throw errors.noSuchUser;
        }

        //only admin can take users
        if (checkConcreteRights(client, ERights.ADMIN)) {
            return this.users
        }
        else {
            throw errors.notAllowedErr;
        }
    }

    @Query(() => User)
    async getUserData(@Arg("login") login: UserLoginInput): Promise<User | undefined> {
        //get client
        const client = getUserByLogin(this.users, login);
        if (!client) {
            throw errors.noSuchUser;
        }

        //return client data
        return client;
    }

    @Mutation(() => User)
    async createAnon(): Promise<User> {
        //new anon user
        const user: User = {
            id: this.users.length + 1,
            rights: ERights.ANON,
            csrf: '',
            auth: ''
        }

        //set auth with a random token
        user.auth = 'auth' + user.id; //TODO replace later
        this.users.push(user)

        //gen anon csrf
        genConcreteUserCSRF(user, user.auth)

        return user
    }

    @Mutation(() => User)
    async createUser(
        @Arg("login") login: UserLoginInput,
        @Arg("nick") nick: string,
        @Arg("pass") pass: string,
        @Arg("userIn") userIn: UserInput
    ): Promise<User> {
        //check if there such user rights exists
        if (!hasEnumValue(userIn.rights, ERights)) {
            throw errors.noSuchRights
        }

        //get client
        const client = getUserByLogin(this.users, login);
        if (!client) {
            throw errors.noSuchUser;
        }

        //auth token is nick + pass
        const authToken = nick + ' ' + pass;

        //find out if already exists
        if(this.users.find(i => i.auth.split(" ")[0] == nick)){
            throw errors.alreadyExists;
        }

        //change existing user if anon is trying to register
        if (checkConcreteRights(client, ERights.ANON)) {
            if (userIn.rights == ERights.ADMIN ||
                userIn.rights == ERights.ANON) {
                throw errors.notAllowedErr;
            }

            client.auth = authToken;
            client.rights = userIn.rights;
            return client
        }

        //if admin, or registered user is trying to reg a new account
        let newUser: User = {
            id: this.users.length + 1,
            rights: ERights.REGISTERED,
            csrf: '',
            auth: authToken
        }

        //registered users cannot make admin account
        if (checkConcreteRights(client, ERights.REGISTERED)) {
            if (userIn.rights == ERights.ADMIN) {
                throw errors.notAllowedErr;
            }
        }
        //while admin can
        else{
            client.rights = userIn.rights;
        }

        //gen new user csrf and add to base
        genConcreteUserCSRF(newUser, newUser.auth);
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