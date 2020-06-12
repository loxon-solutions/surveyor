import {GraphLink, GraphNode} from '../persistence/graph-database';
import {Environment} from '../environment';
import {JobContext} from '../job-context';
import {ParamOption} from '../param-option';

/**
 * Writers can export informations stored in the graph database to various formats, like PUML notation or an actual graph database.
 */
export abstract class AbstractWriter {

    protected constructor(protected env: Environment, protected context: JobContext) {
        this.postConstruct();
    }

    public writeGraphDbContents(): void {
        this.requireParams();
        const nodes = this.env.getDb().getNodes();
        const links = this.env.getDb().getLinks();
        console.log(`Writer - Writing ${nodes.length} nodes and ${links.length} links...`);
        this.beforeWrite();
        nodes.forEach(n => this.writeNode(n));
        links.forEach(l => this.writeLink(l));
        this.afterWrite();
    }

    private requireParams(): void {
        this
            .getParamOptions()
            .filter(o => o.required)
            .forEach(o => {
                if (!this.context.params.get(o.key)) {
                    this.env.fail(`Parameter ${o.key} is required but not given.`);
                }
            })
    }

    protected postConstruct(): void {
        // Children may find this useful.
    }

    protected beforeWrite(): void {
        // Children may find this useful.
    }

    protected async afterWrite(): Promise<void> {
        // Children may find this useful.
    }

    public getParamOptions(): ParamOption<any>[] {
        return [];
    }

    protected abstract async writeNode(node: GraphNode): Promise<void>;
    protected abstract async writeLink(link: GraphLink): Promise<void>;

}
