import { ObjectType, Field, InputType, Resolver, Query, Arg, Mutation, ID, createUnionType } from "type-graphql"
import { Page, PageInput } from "../types/Page";
import { PageList, PageListInput } from "../types/PageList";
import pageLists from "../data/PagesListData"
import users from "../data/UserData"
import ERights from "../utility/ERights";
import { hasEnumValue, stringifyEnum, toEnumVal } from "../utility/EnumUtils";
import errors from "../errors/CommonErr"
import { checkConcreteRights, checkRights, getUserByLogin, getUserIdByLogin } from "../utility/UserUtils";
import { User, UserLoginInput } from "../types/User";
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

    checkListUserRights(list: PageList | PageListInput, client: User) : boolean{
        let hasRights = false;
        
        const listRights = toEnumVal(list!.rights, ERights);

        //admin can access admin rights list
        if (listRights == ERights.ADMIN) {
            if (checkConcreteRights(client, ERights.ADMIN)) {
                hasRights = true;
            }
        }
        //registered and admin user can access registered rights list
        else if (listRights == ERights.REGISTERED) {
            if (checkConcreteRights(client, ERights.REGISTERED) ||
                checkConcreteRights(client, ERights.ADMIN)) {
                hasRights = true;
            }
        }
        //everyone can access anon rights list
        else {
            hasRights = true;
        }

        return hasRights;
    }

    @Query(() => [GetPagesUnion])
    async getPages(
        @Arg("auth") login: UserLoginInput,
        @Arg("lid", type => ID) lid: number,
        @Arg("pids", type => [ID], { nullable: true }) pids?: number[]
    ): Promise<Array<typeof GetPagesUnion>> {
        const list = this.items.find(i => i.id == lid);

        //if there's no such list
        if (!list) {
            throw errors.noListErr;
        }

        //get client
        const client = getUserByLogin(users.items, login);
        if (!client) {
            throw errors.noSuchUser;
        }

        //if list not public
        if (!(list.usersAllowed.length == 0)) {
            let flag = false;
            let nick = client.auth.split(" ")[0];

            //allow if there is client in list
            for (const i in list.usersAllowed) {
                if (nick == list.usersAllowed[i]) {
                    flag = true;
                    break;
                }
            }

            //else forbid access
            if (!flag) {
                throw errors.notAllowedErr
            }
        }

        const hasRights = this.checkListUserRights(list, client);

        //if client has rights to access list
        if (hasRights) {
            //if page ids specified return pages if any
            if (pids) {
                const ret = list!.pages.filter(i => pids.find(j => j == i.id));
                if (ret.length != 0) {
                    return ret;
                }
                else {
                    throw errors.noPagesErr;
                }
            }
            //else return just a whole list
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
        //if there is such rights exists
        if (!hasEnumValue(pageListIn.rights, ERights)) {
            throw errors.noSuchRights;
        }

        //get client
        const client = getUserByLogin(users.items, login);
        if (!client) {
            throw errors.noSuchUser;
        }

        //throw if there is no clients to gain access to
        pageListIn.usersAllowed.forEach(
            i => {
                if (!users.items.find(j => j.auth.split(" ")[0] == i)) {
                    throw errors.noSuchUser
                }
            }
        )

        const nick = client.auth.split(" ")[0];

        //if there is no client in the list specified
        if (!pageListIn.usersAllowed.find(i => i == nick)) {
            //if list is not public
            if (pageListIn.usersAllowed.length != 0) {
                //gain access to client only
                pageListIn.usersAllowed.push(nick)
            }
        }

        const hasRights = this.checkListUserRights(pageListIn, client);

        //if user has rights to create such a list, then create list
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

        //if there's such a list
        if (!list) {
            throw errors.noListErr;
        }

        //get client
        const client = getUserByLogin(users.items, login);
        if (!client) {
            throw errors.noSuchUser;
        }

        const hasRights = this.checkListUserRights(list, client);

        //if user has rights to change such a list
        if (hasRights) {
            const page: Page = { id: list.pages.length + 1, parts: [] };

            //fill page with parts data
            let counter = 1;
            pageIn.parts.forEach(i => {
                page.parts.push({ id: counter, type: i.type, data: i.data });
                counter++;
            })

            //push page
            list.pages.push(page);

            return list.pages.find(i => i.id == list.pages.length)!
        }
        else {
            throw errors.notAllowedErr
        }
    }
}