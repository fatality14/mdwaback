import { IRightsAssignable } from "../types/IRightAssignable";
import { Page } from "../types/Page";
import { User } from "../types/User";
import ERights from "./ERights";

export function checkIsUserAllowed(uid: number, rights: ERights, arr : IRightsAssignable[]): boolean {
    return arr.find(i => i.id == uid)?.rights == rights.toString();
}
