import {Environment} from '../environment';
import {JobContext} from '../job-context';
import {ParamOption} from '../param-option';

/**
 * Parsers provide informations in an internal graph representation.
 * Mostly they extract these informations from some kind of source code.
 */
export abstract class AbstractParser {
    public constructor(protected env?: Environment, protected context?: JobContext){}

    public executeParse(): void {
        this.requireParams();
        this.parse();
    }

    private requireParams(): void {
       this
            .getParamOptions()
            .filter(o => o.required)
            .forEach(o => {
                if (!this.env || !this.context) {
                    return;
                }

                if (!this.context.params.get(o.key)) {
                    this.env.fail(`Parameter ${o.key} is required but not given.`);
                }
            })
    }

    /**
     * Returns parameters used by this parser.
     */
    public getParamOptions(): ParamOption<any>[] {
        return [];
    }

    /**
     * Abstract method where the parsing happens.
     */
    abstract parse(): void
}
