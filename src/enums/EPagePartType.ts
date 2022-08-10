import { registerEnumType } from "type-graphql";

enum EPagePartType {
    CODE = 'CODE',
    MD = 'MD',
    // NAVMD = 'NAVMD',
}

registerEnumType(EPagePartType, {
    name: "EPagePartType"
});

export default EPagePartType