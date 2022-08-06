import { buildSchema } from "type-graphql";
import { PageListResolver } from "./resolvers/PageListResolver";
import { UsersResolver } from "./resolvers/UserResolver";

const schema = buildSchema({
    resolvers: [UsersResolver, PageListResolver],
    emitSchemaFile: "./schema.graphql"
});

export default schema;