import { PageList } from "../types/PageList";

let items: PageList[] = [
    {
        id: 1,
        pages: [
            {
                id: 1,
                parts: [{ id: 1, isCode: false, data: "test" }]
            }
        ],
        rights: 'ADMIN'
    }
]

export default { items };