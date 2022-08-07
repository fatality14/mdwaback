import { PageList } from "../types/PageList";

let items: PageList[] = [
    {
        id: 1,
        pages: [
            {
                id: 1,
                parts: [{ id: 1, type: 0, data: "test" }]
            }
        ],
        rights: 'ADMIN',
        usersAllowed: ["hardauth"]
    }
]

export default { items };