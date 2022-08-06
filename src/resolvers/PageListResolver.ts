import { ObjectType, Field, InputType, Resolver, Query, Arg, Mutation, ID, createUnionType } from "type-graphql"
import { Page, PageInput } from "../types/Page";
import { PageList, PageListInput } from "../types/PageList";
import pageLists from "../data/PagesListData"
import users from "../data/UserData"
import ERights from "../utility/ERights";
import { hasEnumValue, stringifyEnum, toEnumVal } from "../utility/EnumUtils";
import errors from "../errors/CommonErr"
import { checkConcreteRights, checkRights, getUserByLogin, getUserIdByLogin } from "../utility/UserUtils";
import { UserLoginInput } from "../types/User";
import { type } from "os";

const GetPagesUnion = createUnionType({
    name: "GetPagesUnion",
    types: () => [PageList, Page] as const,
    resolveType: v => {
        if ('parts' in v) {
            return Page;
        }
        if ('pages' in v) {
            return PageList;
        }
    }
});

@Resolver(() => PageList)
export class PageListResolver {
    private items = pageLists.items;

    @Query(() => [GetPagesUnion])
    async getPages(
        @Arg("auth") login: UserLoginInput,
        @Arg("lid", type => ID) lid: number,
        @Arg("pids", type => [ID], { nullable: true }) pids?: number[]
    ): Promise<Array<typeof GetPagesUnion>> {
        const list = this.items.find(i => i.id == lid);

        if (!list) {
            throw errors.noListErr;
        }

        const client = getUserByLogin(users.items, login);
        if (!client) {
            throw errors.noSuchUser;
        }

        if (checkConcreteRights(client, toEnumVal(list!.rights, ERights))) {
            if (pids) {
                const ret = list!.pages.filter(i => pids.find(j => j == i.id));
                if (ret.length != 0) {
                    return ret;
                }
                else {
                    throw errors.noPagesErr;
                }
            }
            else {
                return [list!];
            }
        }
        else {
            throw errors.notAllowedErr;
        }
    }

    @Mutation(() => PageList)
    async createPageList(@Arg("login") login: UserLoginInput, @Arg("pageListIn") pageListIn: PageListInput): Promise<PageListInput> {
        if (!hasEnumValue(pageListIn.rights, ERights)) {
            throw errors.noSuchRights;
        }

        const client = getUserByLogin(users.items, login);
        if (!client) {
            throw errors.noSuchUser;
        }

        if (checkConcreteRights(client, toEnumVal(pageListIn.rights, ERights))) {
            const pageList: PageList = {
                id: this.items.length + 1,
                pages: [],
                ...pageListIn,
            }

            this.items.push(pageList)
            return pageList
        }
        else {
            throw errors.notAllowedErr;
        }
    }

    @Mutation(() => Page)
    async addPage(
        @Arg("login") login: UserLoginInput,
        @Arg("lid", type => ID) lid: number,
        @Arg("pageIn") pageIn: PageInput
    ): Promise<Page> {
        const list = this.items.find(i => i.id == lid)

        if (!list) {
            throw errors.noListErr;
        }

        const client = getUserByLogin(users.items, login);
        if (!client) {
            throw errors.noSuchUser;
        }

        if (checkConcreteRights(client, toEnumVal(list.rights, ERights))) {
            const page: Page = { id: list.pages.length + 1, parts: [] };

            let counter = 1;
            pageIn.parts.forEach(i => {
                page.parts.push({ id: counter, isCode: i.isCode, data: i.data });
                counter++;
            })

            list.pages.push(page);

            return list.pages.find(i => i.id == list.pages.length)!
        }
        else{
            throw errors.notAllowedErr
        }
    }
}