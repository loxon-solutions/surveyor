import {AbstractParser} from './abstract.parser';
import {exec, cd} from 'shelljs';
import {readFileSync} from 'fs';
import { GlobSync } from 'glob';
import {GraphDatabase, GraphLink, LinkType, NodeType} from '../persistence/graph-database';
import {Environment} from '../environment';
import {JobContext} from '../job-context';
import {ParamOption} from '../param-option';

export class MavenDependencyTreeService extends AbstractParser{

    private TMP_FILE = 'mvnDependencyTree.tmp';
    private MVN_COMMAND = 'mvn -f server/pom.xml dependency:tree -DoutputType=dot -DoutputFile=';
    private MVN_DOT_OUTPUT_REGEX = /".*?:(.*?):.*?:(.*?)" -> ".*?:(.*?):.*?:(.*?)"/gm;

    private path?: string;
    private db?: GraphDatabase;

    constructor(env?: Environment, context?: JobContext) {
        super(env, context);
        if (env && context) {
            this.path = context.params.get('path');
            this.db = env.getDb();
        }
    }

    public parse(): void {
        if (this.path && this.db) {
            this.getDependencyTree(this.path);
        }

    }

    private getDependencyTree(path: string): void {
        cd(path);
        if (exec(this.MVN_COMMAND + this.TMP_FILE, {silent: true}).code === 0) {
            const pattern = path + '/**/' + this.TMP_FILE;
            console.log('MavenDependencyTreeService - ', `Maven plugin successfully called with pattern ${pattern}`);
            const globSync = new GlobSync(pattern);
            globSync.found.forEach(f => this.parseMavenDotOutput(f));
        }
    }

    private parseMavenDotOutput(file: string): void {
        let mavenOutput: Buffer = readFileSync(file);
        let result;
        let link: GraphLink;
        let linkType;
        let sourceModifier;

        const regexp = new RegExp(this.MVN_DOT_OUTPUT_REGEX);

        while ((result = regexp.exec('' + mavenOutput)) !== null) {
            if (result[2].endsWith(":test")) {
                linkType = LinkType.DEPENDENCY_TEST;
                sourceModifier = result[2].slice(result[2].length-6, 5);
            } else {
                linkType = LinkType.DEPENDENCY;
                sourceModifier = result[2];
            }
            link = {
                source: {
                    name: result[1],
                    type: NodeType.SERVER_LIB,
                    modifier: sourceModifier
                },
                linkType: linkType,
                target: {
                    name: result[3],
                    modifier: result[4],
                    type: NodeType.SERVER_LIB
                }
            };
            if (this.db) {
                this.db.addLink(link);
            }
        }
    }

    public getParamOptions(): ParamOption<any>[] {
        return [new ParamOption<any>('basePackageName', 'com.loxon', 'Base package name to filter maven packages.')];
    }
}
