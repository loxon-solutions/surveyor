import {GraphDatabase} from './persistence/graph-database';
import {Job} from './job';
import {JobContext} from './job-context';
import {ParamOption} from './param-option';
import {AbstractParser} from './parsers/abstract.parser';
import {AbstractWriter} from './writers/abstract-writer';
import {EnvironmentParamsUtil} from './environment-params';

export class Environment {
    paramOptions?: ParamOption<any>[];
    parserOptions?: AbstractParser[];
    writerOptions?: AbstractWriter[];
    defaultParams = new Map();
    private db?: GraphDatabase;
    private jobQueue?: Job[];
    public executionPath = process.cwd();

    static createMainEnvironment(parserOptions: AbstractParser[] | undefined, writerOptions: AbstractWriter[] | undefined): Environment {
        const e = new Environment();
        e.parserOptions = parserOptions;
        e.writerOptions = writerOptions;
        e.initializeParamOptions();
        e.initializeJobQueue();
        return e;
    }

    private initializeParamOptions() {
        this.paramOptions = [];
        this.paramOptions.push(new ParamOption('path', '.', 'Relative path where execution will be started.'));
        this.paramOptions.push(new ParamOption('writers', [], 'Writers to use')); // TODO list possible values.
        this.paramOptions.push(new ParamOption('parsers', [], 'Parsers to use')); // TODO list possible values.

        if (this.parserOptions) {
            this.parserOptions.forEach(p =>
                p.getParamOptions().forEach(o => {
                    o.description += ` Used by ${p.constructor.name}.`;
                    // @ts-ignore
                    this.paramOptions.push(o)
                })
            );
        }

        if (this.writerOptions) {
            this.writerOptions.forEach(p =>
                p.getParamOptions().forEach(o => {
                    o.description += ` Used by ${p.constructor.name}.`;
                    // @ts-ignore
                    this.paramOptions.push(o)
                })
            );
        }
    }

    public pushJob(jobParams: Map<string, any>) {
        if (!this.jobQueue) {
            return;
        }
        this.jobQueue.push(new Job(this, new JobContext(jobParams)));
        console.log('Environment - New job added with params: ' + JSON.stringify(jobParams));
    }

    public popJob(): Job | undefined {
        if (!this.jobQueue) {
            return;
        }
        return this.jobQueue.pop();
    }

    public getDb() {
        if (!this.db) {
            this.db = new GraphDatabase();
        }
        return this.db;
    }

    private initializeJobQueue() {
        this.jobQueue = [];
        this.pushJob(new EnvironmentParamsUtil(this).initializeEnvironmentParams());
    }

    help() {
        console.log('loxon-package-map');
        console.log('=================');
        console.log('\nUsage: npm start -- [--propertyKey propertyValue]...')
        console.log('\nIn case of array parameters you can add multiple elements like: npm start -- --writer WriterA --writer WriterB')
        console.log('\nPath parameters can be relative and absolute as well.\n')
        console.log('\nYou can define all the params in a properties file as well, in this case you have to define the location of this file with param -- paramFile.\n')
        console.log('Known properties:');
        if (this.paramOptions) {
            this.paramOptions.forEach(option => {
                console.log(`  --${option.key} ${option.required ? ' Required! ' : ''} (Default value: ${option.def == null ? 'null' : JSON.stringify(option.def)}) : ${option.description}`);
            })
        }
        process.exit(0);
    }

    public fail(msg: string) {
        console.error(msg);
        process.exit(1);
    }
}
