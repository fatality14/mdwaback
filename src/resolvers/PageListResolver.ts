import { ObjectType, Field, InputType, Resolver, Query, Arg, Mutation, ID, createUnionType } from "type-graphql"
import { Page, PageData, PageInput } from "../types/Page";
import { PageList, PageListData, PageListInput } from "../types/PageList";
import pageLists from "../data/PagesListData"
import users from "../data/UserData"
import ERights from "../enums/ERights";
import EnumUtils from "../utility/EnumUtils";
import errors from "../errors/CommonErr"
import UserUtils from "../utility/UserUtils";
import { User, UserAuthInput } from "../types/User";
import { type } from "os";
import { Part, PartChangeInput, PartData, PartDataInput, PartInput } from "../types/Part";

const GetPagesUnion = createUnionType({
    name: "GetPagesUnion",
    types: () => [PageList, Page] as const,
    resolveType: v => {
        if ("parts" in v.data) {
            return Page;
        }
        if ('pages' in v.data) {
            return PageList;
        }
    }
});

@Resolver(() => PageList)
export class PageListResolver {
    private items = pageLists.items;

    checkListUserRights(list: PageListData | PageListInput, client: User): boolean {
        let hasRights = false;

        const listRights = EnumUtils.toEnumVal(list!.rights, ERights);

        //admin can access admin rights list
        if (listRights == ERights.ADMIN) {
            if (UserUtils.checkRights(client, ERights.ADMIN)) {
                hasRights = true;
            }
        }
        //registered and admin user can access registered rights list
        else if (listRights == ERights.REGISTERED) {
            if (UserUtils.checkRights(client, ERights.REGISTERED) ||
                UserUtils.checkRights(client, ERights.ADMIN)) {
                hasRights = true;
            }
        }
        //everyone can access anon rights list
        else {
            hasRights = true;
        }

        return hasRights;
    }

    tryGetListClient(lid: number, auth: UserAuthInput) : [Error | undefined, {list: PageList, client: User} | undefined]{
        const list = this.items.find(i => i.id == lid);

        //if there's no such list
        if (!list) {
            return [errors.noListErr, undefined];
        }

        //get client
        const client = UserUtils.getByAuth(users.items, auth);
        if (!client) {
            return [errors.noSuchUser, undefined];
        }

        //if list not public
        if (!(list.data.usersAllowed.length == 0)) {
            let flag = false;
            let login = client.data.login;

            //allow if there is client in list
            for (const i in list.data.usersAllowed) {
                if (login == list.data.usersAllowed[i]) {
                    flag = true;
                    break;
                }
            }

            //else forbid access
            if (!flag) {
                return [errors.notAllowedErr, undefined]
            }
        }

        return [undefined, {list, client}];
    }

    @Query(() => [GetPagesUnion])
    async getPages(
        @Arg("auth") auth: UserAuthInput,
        @Arg("lid", type => ID) lid: number,
        @Arg("pids", type => [ID], { nullable: true }) pids?: number[]
    ): Promise<Array<typeof GetPagesUnion>> {
        let list: PageList, client: User;

        const [err, r] = this.tryGetListClient(lid, auth);
        if(err){
            throw err;
        }

        ({list, client} = r!);

        const hasRights = this.checkListUserRights(list.data, client);

        //if client has rights to access list
        if (hasRights) {
            //if page ids specified return pages if any
            if (pids) {
                const ret = list!.data.pages.filter(i => pids.find(j => j == i.id));
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
    async createPageList(
        @Arg("auth") auth: UserAuthInput,
        @Arg("pageListIn") pageListIn: PageListInput
    ): Promise<PageList> {
        //get client
        const client = UserUtils.getByAuth(users.items, auth);
        if (!client) {
            throw errors.noSuchUser;
        }

        //throw if there is no clients to gain access to
        pageListIn.usersAllowed.forEach(
            i => {
                if (!users.items.find(j => j.data.login == i)) {
                    throw errors.noSuchUser
                }
            }
        )

        const login = client.data.login;

        //if list is not public
        if (pageListIn.usersAllowed.length != 0) {
            //if there is no client in the list specified
            if (!pageListIn.usersAllowed.find(i => i == login)) {
                //gain access to client only
                pageListIn.usersAllowed.push(login)
            }
        }

        const hasRights = this.checkListUserRights(pageListIn, client);

        //if user has rights to create such a list, then create list
        if (hasRights) {
            let pageListData = new PageListData;
            pageListData.pages = [];
            pageListData.rights = pageListIn.rights;
            pageListData.usersAllowed = pageListIn.usersAllowed;

            let pageList: PageList = new PageList;
            pageList.id = this.items.length + 1;
            pageList.data = pageListData;

            this.items.push(pageList)

            return pageList;
        }
        else {
            throw errors.notAllowedErr;
        }
    }

    @Mutation(() => Page)
    async addPage(
        @Arg("auth") auth: UserAuthInput,
        @Arg("lid", () => ID) lid: number,
        @Arg("pageIn") pageIn: PageInput
    ): Promise<Page> {
        let list: PageList, client: User;

        const [err, r] = this.tryGetListClient(lid, auth);
        if(err){
            throw err;
        }

        ({list, client} = r!);

        const hasRights = this.checkListUserRights(list.data, client);

        //if user has rights to change such a list
        if (hasRights) {
            const pageData = new PageData;
            pageData.parts = [];
            pageData.name = pageIn.name;

            const page: Page = { id: list.data.pages.length + 1, data: pageData };

            //fill page with parts data
            let counter = 1;
            pageIn.parts.forEach(i => {
                const partData = new PartData;
                partData.content = i.content;
                partData.type = i.type;

                const part = new Part;
                part.id = counter;
                part.data = partData;

                page.data.parts.push(part);
                counter++;
            })

            //push page
            list.data.pages.push(page);

            return list.data.pages.find(i => i.id == list.data.pages.length)!
        }
        else {
            throw errors.notAllowedErr
        }
    }

    @Mutation(() => Part)
    async updatePagePart(
        @Arg("auth") auth: UserAuthInput,
        @Arg("lid", () => ID) lid: number,
        @Arg("pid", () => ID) pid: number,
        @Arg("part", () => PartChangeInput) changePart: PartChangeInput
    ): Promise<Part> {
        let list: PageList, client: User;

        const [err, r] = this.tryGetListClient(lid, auth);
        if(err){
            throw err;
        }

        ({list, client} = r!);

        const hasRights = this.checkListUserRights(list.data, client);

        //if client has rights to access list
        if (hasRights) {
            const page = list.data.pages.find(i => i.id == pid);
            if (!page) {
                throw errors.noPagesErr;
            }

            let part = page.data.parts.find(i => i.id == changePart.id);
            if (!part) {
                throw errors.noSuchPagePart;
            }

            part.data = changePart.data;

            if (changePart.swapid) {
                let swapPart = list.data.pages.find(i => i.id == changePart.swapid);
                if (swapPart) {
                    part.id = swapPart.id; //old part now have swapid
                    swapPart.id = changePart.id; //part to swap with now have old part id
                }
            }

            return part;
        }
        else {
            throw errors.notAllowedErr;
        }
    }

    @Mutation(() => Part)
    async insertPagePart(
        @Arg("auth") auth: UserAuthInput,
        @Arg("lid", () => ID) lid: number,
        @Arg("pid", () => ID) pid: number,
        @Arg("part", () => PartInput) addPart: PartInput
    ): Promise<Part> {
        let list: PageList, client: User;

        const [err, r] = this.tryGetListClient(lid, auth);
        if(err){
            throw err;
        }

        ({list, client} = r!);

        const hasRights = this.checkListUserRights(list.data, client);

        //if client has rights to access list
        if (hasRights) {
            const page = list.data.pages.find(i => i.id == pid);
            if (!page) {
                throw errors.noPagesErr;
            }

            let parts = page.data.parts;
            let targetPart = parts.find(i => i.id == addPart.id);

            //if such a part with id already exists
            if (targetPart) {
                //shift parts ids by 1 to provide a space
                parts.forEach(i => {
                    if(i.id >= addPart.id){
                        ++i.id;
                    }
                })
                //push part at a provied space
                parts.push(addPart);
            }
            else{
                //if there is a part with previous id
                if(parts.find(i => i.id == addPart.id-1)){
                    //add part
                    parts.push(addPart);
                }
                else{
                    throw errors.notAppendingId
                }
            }

            console.log(parts)
            return addPart;
        }
        else {
            throw errors.notAllowedErr;
        }
    }

    //TODO change/delete requests here
}