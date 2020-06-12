import {AbstractWriter} from './writers/abstract-writer';
import {AbstractParser} from './parsers/abstract.parser';
import {Environment} from './environment';
import {cd} from 'shelljs';
import {JobContext} from './job-context';

export class Job {
    private writers: AbstractWriter[];
    private parsers: AbstractParser[];

    constructor(private environment: Environment, private context: JobContext) {
        this.environment = environment;
        this.initializeParsers();
        this.initializeWriters();
    }

    public execute(): void {
        this.parsers.forEach(p => { this.resetState(); p.executeParse()});
        this.writers.forEach(w => { this.resetState(); w.writeGraphDbContents()});
    }

    private resetState() {
        cd(this.environment.executionPath);
    }

    private initializeParsers() {
        this.parsers = [];
        this.context.params.get('parsers').forEach( (p: string) => {
            const parser = this.environment.parserOptions.find(p2 => { return p2.constructor.name === p });

            if (!parser) {
                this.environment.fail(`Could not find parser ${p}`);
            }

            // @ts-ignore
            this.parsers.push(new parser.constructor(this.environment, this.context))
        });
    }

    private initializeWriters() {
        this.writers = [];
        this.context.params.get('writers').forEach( (w: string) => {
            const writer = this.environment.writerOptions.find(w2 => w2.constructor.name === w);

            if (!writer) {
                this.environment.fail(`Could not find writer ${w}`);
            }

            // @ts-ignore
            this.writers.push(new writer.constructor(this.environment, this.context));
        } )
    }

}
