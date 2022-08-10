import { ObjectType, Field, InputType, Resolver, Query, Arg, Mutation, ID } from "type-graphql"
import { User, UserAuthInput, UserChangeInput, UserData, UserRightsInput } from "../types/User"
import userList from "../data/UserData"
import UserUtils from "../utility/UserUtils";
import ERights from "../enums/ERights";
import errors from "../errors/CommonErr";
import EnumUtils from "../utility/EnumUtils";

@Resolver(() => User)
export class UsersResolver {
    private users: User[] = userList.items;

    @Query(() => [User])
    async getUsers(@Arg("auth") auth: UserAuthInput): Promise<User[]> {
        //get client
        const client = UserUtils.getByAuth(this.users, auth);
        if (!client) {
            throw errors.noSuchUser;
        }

        //only admin can take users
        if (UserUtils.checkRights(client, ERights.ADMIN)) {
            return this.users
        }
        else {
            throw errors.notAllowedErr;
        }
    }

    @Query(() => User)
    async getUserData(@Arg("auth") auth: UserAuthInput): Promise<User | undefined> {
        //get client
        const client = UserUtils.getByAuth(this.users, auth);
        if (!client) {
            throw errors.noSuchUser;
        }

        //return client data
        return client;
    }

    @Mutation(() => User)
    async createAnon(): Promise<User> {
        //new anon user
        let user: User = new User;
        user.id = this.users.length + 1;

        user.data = new UserData;

        //set auth with a random token
        user.data.login = 'login' + user.id; //TODO replace later
        user.data.password = 'pass' + user.id; //TODO replace later
        user.data.rights = ERights.ANON;

        this.users.push(user)

        //gen anon csrf
        UserUtils.genCSRF(user);

        return user
    }

    @Mutation(() => User)
    async createUser(
        @Arg("auth") auth: UserAuthInput,
        @Arg("login") login: string,
        @Arg("password") password: string,
        @Arg("userIn") userIn: UserRightsInput
    ): Promise<User> {
        //check if there such user rights exists
        if (!EnumUtils.hasEnumValue(userIn.rights, ERights)) {
            throw errors.noSuchRights
        }

        //get client
        const client = UserUtils.getByAuth(this.users, auth);
        if (!client) {
            throw errors.noSuchUser;
        }

        //find out if already exists
        if (this.users.find(i => i.data.login == login)) {
            throw errors.userAlreadyExists;
        }

        //change existing user if anon is trying to register
        if (UserUtils.checkRights(client, ERights.ANON)) {
            if (userIn.rights == ERights.ADMIN ||
                userIn.rights == ERights.ANON) {
                throw errors.notAllowedErr;
            }

            client.data.login = login;
            client.data.password = password;
            client.data.rights = userIn.rights;
            return client
        }

        //if admin, or registered user is trying to reg a new account
        let newUser: User = new User;

        newUser.id = this.users.length + 1;
        newUser.data = new UserData;

        newUser.data.rights = ERights.REGISTERED;
        newUser.data.password = password;
        newUser.data.login = login;
        newUser.data.rights = userIn.rights;

        //registered users cannot make admin/anon account
        if (UserUtils.checkRights(client, ERights.REGISTERED)) {
            if (userIn.rights == ERights.ADMIN ||
                userIn.rights == ERights.ANON) {
                throw errors.notAllowedErr;
            }
        }
        //while admin can
        else {
            client.data.rights = userIn.rights;
        }

        //gen new user csrf and add to base
        UserUtils.genCSRF(newUser);
        this.users.push(newUser);

        return newUser
    }

    @Mutation(() => User)
    async updateUser(
        @Arg("auth") auth: UserAuthInput,
        @Arg("data") input: UserChangeInput
    ): Promise<User> {
        //get client
        const client = UserUtils.getByAuth(this.users, auth);
        if (!client) {
            throw errors.noSuchUser;
        }

        if (input.login) {
            client.data.login = input.login;
        }

        if (input.password) {
            client.data.password = input.password;
        }

        if (input.rights) {
            client.data.rights = input.rights;
        }

        console.log(UserUtils.getByAuth(this.users, auth))

        return client
    }

    //TODO change/delete requests here
}