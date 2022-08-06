import { ObjectType, Field, InputType, Resolver, Query, Arg, Mutation, ID, createUnionType } from "type-graphql"
import { Page, PageInput } from "../types/Page";
import { PageList, PageListInput } from "../types/PageList";
import pageLists from "../data/PagesListData"
import users from "../data/UserData"
import ERights from "../utility/ERights";
import { hasEnumValue, stringifyEnum, toEnumVal } from "../utility/EnumUtils";
import errors from "../errors/CommonErr"
import { checkIsUserAllowed } from "../utility/UserUtils";

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
        @Arg("lid") lid: number,
        @Arg("uid") uid: number,
        @Arg("pids", type => [ID], { nullable: true }) pids?: number[]
    ): Promise<Array<typeof GetPagesUnion> | undefined> {
        const list = this.items.find(i => i.id == lid);

        if(!list){
            throw errors.noListErr;
        }

        if (checkIsUserAllowed(uid, toEnumVal(list!.rights, ERights), this.items)) {
            if (pids) {
                const ret = list!.pages.filter(i => pids.find(j => j == i.id));
                if(ret.length != 0){
                    return ret;
                }
                else{
                    throw errors.noPagesErr;
                }
            }
            else {
                return [list!];
            }
        }
        else{
            throw errors.notAllowedErr;
        }
    }

    @Mutation(() => PageList)
    async createPageList(@Arg("input") input: PageListInput): Promise<PageListInput> {
        if(!hasEnumValue(input.rights, ERights)){
            throw errors.noSuchRights;
        }

        const pageList : PageList = {
            id: this.items.length + 1,
            pages: [],
            ...input,
        }
        
        this.items.push(pageList)
        return pageList
    }

    @Mutation(() => Page)
    async addPage(
        @Arg("lid", type => ID) lid: number,
        @Arg("input") input: PageInput
    ): Promise<Page> {
        const list = this.items.find(i => i.id == lid)

        if (!list) {
            throw errors.noListErr;
        }

        const page : Page = {id: list.pages.length + 1, parts: []};

        let counter = 1;
        input.parts.forEach(i => {
            page.parts.push({id: counter, isCode: i.isCode, data: i.data});
            counter++;
        }) 

        list.pages.push(page);

        return list.pages.find(i => i.id == list.pages.length)!
    } 
}