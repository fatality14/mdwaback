import ERights from "../enums/ERights";
import { User } from "../types/User";

let items: User[] = [
    { id: 1, data: {rights: ERights.ANON, csrf: "csrf1", login: "login1", password: 'pass1' }},
    { id: 2, data: {rights: ERights.ADMIN, csrf: "csrf2", login: "admin", password: 'adminpass'}},
    { id: 3, data: {rights: ERights.REGISTERED, csrf: "csrf3", login: "reg", password: 'regpass'}}
]

export default { items };