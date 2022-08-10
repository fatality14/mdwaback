import EnumUtils from "../utility/EnumUtils";
import ERights from "../enums/ERights";

const noListErr = new Error("No such list with specified id");
const noPagesErr = new Error("No such pages with specified id");
const notAllowedErr = new Error("The user has no access to this operation");
const noSuchRights = new Error("There is no such rigts among " + EnumUtils.stringifyEnum(ERights, ' '));
const noSuchUser = new Error("There is no such a user in list");
const userAlreadyExists = new Error("User already exists");
const noSuchPagePart = new Error("There is no such a part in list");
const unknowError = new Error("Unknown error");
const notLastId = new Error("Element added must continue id numertaion")

export default {
    noListErr,
    noPagesErr,
    notAllowedErr,
    noSuchRights,
    noSuchUser,
    userAlreadyExists,
    noSuchPagePart,
    unknowError,
    notAppendingId: notLastId
}