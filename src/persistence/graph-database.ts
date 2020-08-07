/**
 * Naive implementation of an internal in-memory graph database
 */
export class GraphDatabase {
    private nodes:{[index: string]:GraphNode} = {};
    private links: Set<GraphLink> = new Set<GraphLink>();

    public addLink(link: GraphLink) {
        this.addNodeIfNecessary(link.source);
        this.addNodeIfNecessary(link.target);
        this.links.add(link);
    }

    public getNodes(q: GraphDatabaseQuery | null = null): GraphNode[] {
        let res = Object.values(this.nodes);
        res = res.filter(n => { if (q && q.nodeNameRegex) { n.name.match(q.nodeNameRegex)}});
        return res;
    }

    public getLinks(q: GraphDatabaseQuery | null = null): GraphLink[] {
        let res = [...this.links];
        res = res.filter(l => { if (q && q.nodeNameRegex) { l.source.name.match(q.nodeNameRegex) && l.target.name.match(q.nodeNameRegex)}});
        return res;
    }

    private addNodeIfNecessary(node: GraphNode) {
        if (!(node.name in this.nodes)) {
            this.nodes[node.name] = new GraphNode(node.name, node.type);
        }
    }
}

export class GraphNode {
    constructor(name: string, type: NodeType) {
        this.name = name;
        this.type = type;
    }
    public name: string;
    public type: NodeType;
    public modifier?: string;
}

export interface GraphLink {
    source: GraphNode;
    linkType: LinkType
    target: GraphNode;
    label?: string;
}

export enum LinkType {
    DEPENDENCY = "DEPENDENCY",
    DEPENDENCY_TEST = "DEPENDENCY_TEST",
    USAGE = "USAGE",
    QUEUE_WRITE = "QUEUE_WRITE",
    QUEUE_READ = "QUEUE_READ",
    MESSAGE_WRITE = "MESSAGE_WRITE",
    MESSAGE_READ = "MESSAGE_READ"
}

// TODO this is not so extendable...
export enum NodeType {
    SERVER_LIB = "SERVER_LIB",
    CLIENT_LIB = "CLIENT_LIB",
    KAFKA_QUEUE = "KAFKA_QUEUE",
    TEPEE_MESSAGE = "TEPEE_MESSAGE"
}

export interface GraphDatabaseQuery {
    nodeNameRegex?: RegExp;
}
