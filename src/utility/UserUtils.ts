//TODO move to types/User.ts


import { Page } from "../types/Page";
import { User, UserAuthInput } from "../types/User";
import CSRFUtils from "./CSRFUtills";
import ERights from "../enums/ERights";

export default class UserUtils {
    static genCSRF(user: User): number {
        //TODO forbid last user csrf
        //TODO make multiple device csrf

        user.data.csrf = CSRFUtils.genCSRF(user.id.toString());
        return user.id;
    }

    static getByLogin(arr: User[], login: string): User | undefined {
        let user = arr.find(i => i.data.login == login);

        if (user) {
            return user;
        }
    }

    static getByCSRF(arr: User[], csrf: string): User | undefined {
        let user = arr.find(i => i.data.csrf == csrf);

        if (user) {
            return user;
        }
    }

    static getByAuth(arr: User[], auth: UserAuthInput): User | undefined {
        if (auth.csrf) {
            let user = this.getByCSRF(arr, auth.csrf);
            if (user) {
                return user;
            }
        }

        let usersWithPass = arr.filter(i => i.data.password == auth.password);
        let userWithLogin = this.getByLogin(arr, auth.login);
        if (userWithLogin) {
            return usersWithPass.find(i => i.data.password == userWithLogin?.data.password);;
        }
    }

    static checkRights(user: User, rights: ERights): boolean {
        return user.data.rights == rights.toString();
    }
}