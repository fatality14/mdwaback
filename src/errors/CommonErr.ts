import { stringifyEnum } from "../utility/EnumUtils";
import ERights from "../utility/ERights";

const noListErr = new Error("No such list with specified id");
const noPagesErr = new Error("No such pages with specified id");
const notAllowedErr = new Error("The user has no access to this operation");
const noSuchRights = new Error("There is no such rigts among " + stringifyEnum(ERights, ' '));
const noSuchUser = new Error("There is no such a user in list");
const alreadyExists = new Error("User already exists");

export default {noListErr, noPagesErr, notAllowedErr, noSuchRights, noSuchUser, alreadyExists}