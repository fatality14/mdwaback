import EPagePartType from "../enums/EPagePartType";
import ERights from "../enums/ERights";
import { PageList } from "../types/PageList";

let items: PageList[] = [
    {
        id: 1,
        data: {
            pages:
                [
                    {
                        id: 1,
                        data: {
                            parts: [
                                {
                                    id: 1, data: {
                                        type: EPagePartType.CODE, content: "test"
                                    }
                                },
                                {
                                    id: 2, data: {
                                        type: EPagePartType.CODE, content: "test1"
                                    }
                                }
                            ],
                            name: "testpagename"
                        },
                    }
                ],
            rights: ERights.ADMIN,
            usersAllowed: []
        },
    }
]

export default { items };