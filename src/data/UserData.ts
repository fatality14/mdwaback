import { User } from "../types/User";

let items: User[] = [
    { id: 1, rights: "ANON", csrf: "csrf1", auth: "auth1" },
    { id: 2, rights: "ADMIN", csrf: "csrf2", auth: "hardauth" }
    // { id: 1, rights: "ADMIN", csrf: '777', auth: '777' },
    // { id: 2, rights: "REGISTERED", csrf: '777', auth: '666' },
    // { id: 3, rights: "ANON", csrf: '777', auth: '555' },
]

export default { items };