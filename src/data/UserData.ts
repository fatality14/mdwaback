import { User } from "../types/User";

let items: User[] = [
    { id: 1, rights: "ANON", csrf: "csrf1", auth: "auth1" },
    { id: 2, rights: "ADMIN", csrf: "csrf2", auth: "admin hardauth" }
]

export default { items };