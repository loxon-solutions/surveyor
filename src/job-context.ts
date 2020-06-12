export class JobContext {

    // TODO make params private, getter should check if param was defined as option.

    constructor(public params: Map<string, any>) {
    }

    public forkParams(fork: Map<string, any>): Map<string, any> {
        const newParams = new Map();

        this.params.forEach((value, key) => {
            newParams.set(key, value);
        })

        fork.forEach((value, key) => {
            newParams.set(key, value);
        })

        return newParams;
    }
}
