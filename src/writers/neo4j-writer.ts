import {AbstractWriter} from './abstract-writer';
import {GraphLink, GraphNode} from '../persistence/graph-database';
import neo4j, {Driver} from 'neo4j-driver'
import {ParamOption} from '../param-option';

export class Neo4jWriter extends AbstractWriter {

    private driver?: Driver;

    private readonly PARAM_NAME_URL = 'neo4jUrl';
    private readonly PARAM_NAME_USER = 'neo4jUser';
    private readonly PARAM_NAME_PWD = 'neo4jPassword';

    protected postConstruct(): void {
        super.postConstruct();
        if (this.context) {
            this.driver = neo4j.driver(this.context.params.get(this.PARAM_NAME_URL),
                neo4j.auth.basic(this.context.params.get(this.PARAM_NAME_USER), this.context.params.get(this.PARAM_NAME_PWD)));
            console.log('Neo4jWriter constructed.');
        }
    }

    protected async writeLink(link: GraphLink): Promise<void> {
        const command = `MATCH (a:${link.source.type}),(b:${link.target.type})`
            +  `WHERE a.name='${link.source.name}' AND b.name='${link.target.name}'`
            +  `CREATE (a)-[:${link.linkType} { label: '${link.label}' }]->(b)`;
        await this.executeCommand(command);
    }

    protected async writeNode(node: GraphNode): Promise<void> {
        const command = `CREATE (a:${node.type} { name: '${node.name}'${node.modifier ? ', modifier: ' + node.modifier : ''}}) RETURN a`;
        await this.executeCommand(command);
    }

    private async executeCommand(command: string): Promise<void> {
        if (!this.context) {
            return;
        }

        const driver = neo4j.driver(this.context.params.get(''), neo4j.auth.basic("neo4j", "test"));
        const session = driver.session();
        try {
            await session.writeTransaction((tx: any) => tx.run(command, {}));
            console.log('Executed', command);
        } catch(err) {
            console.log('Error happend', command, err);
        } finally {
            await session.close();
            await driver.close();
        }
    }

    protected async afterWrite(): Promise<void> {
        if (this.driver) {
            await this.driver.close();
        }
        await super.afterWrite();
    }

    public getParamOptions(): ParamOption<any>[] {
        return [
            new ParamOption<any>(this.PARAM_NAME_URL, null, 'Bolt address of the neo4j instance.'),
            new ParamOption<any>(this.PARAM_NAME_USER, null, 'Username of the neo4j instance.'),
            new ParamOption<any>(this.PARAM_NAME_PWD, null, 'Password of the neo4j instance.')
        ];
    }

}
