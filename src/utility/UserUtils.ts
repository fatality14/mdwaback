import { Page } from "../types/Page";
import { User, UserLoginInput as UserLoginInput } from "../types/User";
import ERights from "./ERights";

function genCSRF(seed: string): string{
    return seed; //TODO replace later
}

export function authentificateUser(arr: User[], auth?: string): number {
    //TODO forbid last user csrf
    //TODO make multiple device csrf

    if (auth) {
        let user = arr.find(i => i.auth == auth);

        if (user) {
            user.csrf = genCSRF('csrf' + user.id); 
            return user.id;
        }
    }
    return -1;
}

export function authentificateConcreteUser(user: User, auth?: string): number {
    //TODO forbid last user csrf
    //TODO make multiple device csrf

    if (auth) {
        user.csrf = genCSRF('csrf' + user.id);
        return user.id;
    }
    return -1;
}

export function getUserByAuth(arr: User[], auth?: string): User | undefined {
    if (auth) {
        let user = arr.find(i => i.auth == auth);

        if (user) {
            return user;
        }
    }
}

export function getUserIdByCSRF(arr: User[], csrf?: string): number {
    if (csrf) {
        let user = arr.find(i => i.csrf == csrf);

        if (user) {
            return user.id;
        }
    }
    return -1;
}

export function getUserByCSRF(arr: User[], csrf?: string): User | undefined {
    if (csrf) {
        let user = arr.find(i => i.csrf == csrf);

        if (user) {
            return user;
        }
    }
}

export function getUserIdByLogin(arr: User[], login: UserLoginInput): number {
    let id = getUserIdByCSRF(arr, login.csrf);
    if (id != -1) {
        return id;
    }

    id = authentificateUser(arr, login.auth);
    if (id != -1) {
        return id;
    }

    return -1;
}

export function getUserByLogin(arr: User[], login: UserLoginInput): User | undefined {
    let user = getUserByCSRF(arr, login.csrf);
    if (user) {
        return user;
    }

    user = getUserByAuth(arr, login.auth);
    if (user) {
        return user;
    }
}

export function checkRights(uid: number, rights: ERights, arr: User[]): boolean {
    return arr.find(i => i.id == uid)?.rights == rights.toString();
}

export function checkConcreteRights(user: User, rights: ERights): boolean {
    return user.rights == rights.toString();
}

