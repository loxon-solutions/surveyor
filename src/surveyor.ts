import {AbstractParser} from './parsers/abstract.parser';
import {AbstractWriter} from './writers/abstract-writer';
import {Environment} from './environment';
import {Job} from './job';
import {PumlWriter} from './writers/puml-writer';
import {Neo4jWriter} from './writers/neo4j-writer';
import {MavenDependencyTreeService} from './parsers/maven-dependency-tree.parser';
import {JobContext} from './job-context';

export class Surveyor {
    private parsers?: AbstractParser[];
    private writers?: AbstractWriter[];

    constructor() {
        this.addWriter(PumlWriter);
        this.addWriter(Neo4jWriter);
        this.addParser(MavenDependencyTreeService);
    }

    public addParser<T extends AbstractParser>(parser: new (env?: Environment, context?: JobContext) => T ): Surveyor {
        if (!this.parsers) {
            this.parsers = [];
        }
        this.parsers.push(new parser(undefined, undefined));
        return this;
    }

    public addWriter<T extends AbstractWriter>(writer: new (env?: Environment, context?: JobContext) => T ): Surveyor {
        if (!this.writers) {
            this.writers = [];
        }
        this.writers.push(new writer(undefined, undefined));
        return this;
    }

    public run() {

        const env = Environment.createMainEnvironment(this.parsers, this.writers);

        console.time('Execution');

        let nextJob: Job | undefined;
        let jobIndex = 0;
        while((nextJob = env.popJob()) !== undefined) {
            nextJob.execute();
            console.log(`Job #${++jobIndex} executed.`);
        }

        console.timeEnd('Execution');
    }


}
