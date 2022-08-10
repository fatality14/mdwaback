import { registerEnumType } from "type-graphql";

enum ERights {
    ADMIN = 'ADMIN',
    ANON = 'ANON',
    REGISTERED = 'REGISTERED',
}

registerEnumType(ERights, {
    name: "ERights"
});

export default ERights