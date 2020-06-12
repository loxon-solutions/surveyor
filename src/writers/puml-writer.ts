import {GraphLink, GraphNode, LinkType, NodeType} from '../persistence/graph-database';
import {PumlNotation} from '../types/puml-notation';
import {AbstractWriter} from './abstract-writer';
import {writeFileSync} from "fs";
import {ParamOption} from '../param-option';

export class PumlWriter extends AbstractWriter {

    private buffer: PumlNotation;

    private nodeToPumlNotation(node: GraphNode): PumlNotation {
        switch(node.type) {
            case NodeType.SERVER_LIB:
                return 'LoxonServerLib(' + this.toPumlAliasCompatible(node.name)  +', "' + node.name +'", "")';
            case NodeType.KAFKA_QUEUE:
                return 'LoxonKafkaQueue(' + this.toPumlAliasCompatible(node.name) + ')';
            case NodeType.TEPEE_MESSAGE:
                return 'TepeeMessage(' + this.toPumlAliasCompatible(node.name)  +', "' + node.name +'")';
        }
    }

    private linkToPumlNotation(link: GraphLink): PumlNotation {
        const sourceName = this.toPumlAliasCompatible(link.source.name);
        const targetName = this.toPumlAliasCompatible(link.target.name);

        switch(link.linkType) {
            case LinkType.DEPENDENCY:
            case LinkType.DEPENDENCY_TEST:
                return sourceName + ' ..> ' + targetName;
            case LinkType.USAGE:
                return sourceName + ' --> ' + targetName;
            case LinkType.QUEUE_READ:
            case LinkType.QUEUE_WRITE:
                return 'LoxonKafkaConnection(' + sourceName + ', ' + targetName + ', ' + (link.label ? link.label : '""') + ')';
            case LinkType.MESSAGE_READ:
            case LinkType.MESSAGE_WRITE:
                return 'TepeeMessageConnection(' + sourceName + ', ' + targetName + ', ' + (link.label ? link.label : '""') + ')';
        }
    }

    private toPumlAliasCompatible(input: string): string {
        return input.replace(/-/g, '_');
    }

    /**
     * This writer uses loxon puml library. To use your own library, create a new writer (or make this parametrizable).
     */
    private getLoxonLibImport(): string {
        return '\n!includeurl https://bitbucket.org/loxonproddev/puml-common/raw/TEPEEMESSAGE/source/common.puml\n'
         + '!includeurl https://bitbucket.org/loxonproddev/puml-common/raw/TEPEEMESSAGE/source/icons.puml\n';
    }

    private getFooterMessage(): string {
        return 'center footer Generated by surveyor at ' + new Date().toISOString() + '\n@enduml';
    }

    protected async afterWrite(): Promise<void> {
        this.buffer += this.getFooterMessage();
        writeFileSync(this.context.params.get('outputPath'), this.buffer, { encoding: 'utf8', flag: 'a' });
        console.log('PumlWriter - Output file successfully written. :)');
    }

    protected beforeWrite(): void {
        if (!this.context.params.get('outputPath')) {
            throw new Error("outputPath parameter is needed for PUMLWriter!");
        }
        this.buffer = '@startuml\n';
        this.buffer += this.getLoxonLibImport();
    }

    protected async writeLink(link: GraphLink): Promise<void> {
        this.buffer += this.linkToPumlNotation(link) + '\n';
    }

    protected async writeNode(node: GraphNode): Promise<void> {
        this.buffer += this.nodeToPumlNotation(node) + '\n';
    }

    public getParamOptions(): ParamOption<any>[] {
        return [new ParamOption<any>('outputPath', './output.puml', 'Target where the output will be saved.')];
    }
}