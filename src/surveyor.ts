import {AbstractParser} from './parsers/abstract.parser';
import {AbstractWriter} from './writers/abstract-writer';
import {Environment} from './environment';
import {Job} from './job';
import {PumlWriter} from './writers/puml-writer';
import {Neo4jWriter} from './writers/neo4j-writer';
import {MavenDependencyTreeService} from './parsers/maven-dependency-tree.parser';

export class Surveyor {
    private parsers: AbstractParser[];
    private writers: AbstractWriter[];

    constructor() {
        this.addWriter(PumlWriter);
        this.addWriter(Neo4jWriter);
        this.addParser(MavenDependencyTreeService);
    }

    // @ts-ignore
    public addParser<T extends AbstractParser>(parser: typeof T): Surveyor {
        if (!this.parsers) {
            this.parsers = [];
        }
        this.parsers.push(new parser(null, null));
        return this;
    }

    // @ts-ignore
    public addWriter<T extends AbstractWriter>(writer: typeof T): Surveyor {
        if (!this.writers) {
            this.writers = [];
        }
        this.writers.push(new writer(null, null));
        return this;
    }

    public run() {

        const env = Environment.createMainEnvironment(this.parsers, this.writers);

        console.time('Execution');

        let nextJob: Job;
        let jobIndex = 0;
        while((nextJob = env.popJob()) !== undefined) {
            nextJob.execute();
            console.log(`Job #${++jobIndex} executed.`);
        }

        console.timeEnd('Execution');
    }


}
