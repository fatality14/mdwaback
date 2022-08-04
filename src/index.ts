import "reflect-metadata";
import cors from "cors";
import express, { Express } from "express";
import { graphqlHTTP } from "express-graphql";
import schema from "./schema";
import { Field, ObjectType, InputType } from "type-graphql"

(async () => {
    const app: Express = express();
    const port = 12345;

    app.use(cors())


    const root = {

    }

    app.use('/graphql', graphqlHTTP({
        graphiql: true,
        schema: await schema,
        rootValue: root
    }))

    app.listen(port, () => { console.log("Listening on port " + port) });
})()