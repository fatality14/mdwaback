export default class EnumUtils {
    static toEnumVal(value: string, e: any) {
        return e[value as keyof typeof e]
    }

    static hasEnumValue(value: string, e: any) {
        return e[this.toEnumVal(value, e)] ? true : false;
    }

    static enumToStrArr(e: any) {
        return Object.keys(e);
    }

    static stringifyEnum(e: any, separator: string) {
        return this.enumToStrArr(e).join(separator);
    }
}