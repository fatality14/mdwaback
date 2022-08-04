import { Arg, buildSchema, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";

@ObjectType()
export class User {
    @Field()
    id!: number
    @Field()
    name!: string
    @Field()
    email!: string
}

@InputType()
export class UserInput implements Pick<User, "name" | "email"> {
    @Field()
    name!: string
    @Field()
    email!: string
}

@Resolver(() => User)
export class UsersResolver {
    private users: User[] = [
        { id: 1, name: "John Doe", email: "johndoe@gmail.com" },
        { id: 2, name: "Jane Doe", email: "janedoe@gmail.com" },
        { id: 3, name: "Mike Doe", email: "mikedoe@gmail.com" },
    ]

    @Query(() => [User])
    async getUsers(): Promise<User[]> {
        return this.users
    }

    @Query(() => User)
    async getUser(@Arg("id") id: number): Promise<User | undefined> {
        const user = this.users.find(u => u.id === id)
        return user
    }

    @Mutation(() => User)
    async createUser(@Arg("input") input: UserInput): Promise<User> {
        const user = {
            id: this.users.length + 1,
            ...input,
        }
        
        this.users.push(user)
        return user
    }

    @Mutation(() => User)
    async updateUser(
        @Arg("id") id: number,
        @Arg("input") input: UserInput
    ): Promise<User> {
        const user = this.users.find(u => u.id === id)
        
        if (!user) {
            throw new Error("User not found")
        }

        const updatedUser = {
            ...user,
            ...input,
        }

        this.users = this.users.map(u => (u.id === id ? updatedUser : u))

        return updatedUser
    }
}

const schema = buildSchema({
    resolvers: [UsersResolver]
});

export default schema;