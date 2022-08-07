export function toEnumVal(value : string, e : any){
    return e[value as keyof typeof e]
}

export function hasEnumValue(value: string, e: any){
    return e[toEnumVal(value, e)] ? true : false;
}

export function enumToStrArr(e: any){
    return Object.keys(e);
}

export function stringifyEnum(e: any, separator: string){
    return enumToStrArr(e).join(separator);
}
