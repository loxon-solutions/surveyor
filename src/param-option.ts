export class ParamOption<T> {
    constructor(public key: string, public def: T, public description: string, public required = true) {
    }
}
