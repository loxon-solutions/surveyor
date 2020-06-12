import {Surveyor} from './surveyor/surveyor';
import {ProjectDependencyParser} from './parsers/project-dependency.parser';
import {PumlWriter} from './surveyor/writers/puml-writer';
import {TepeeMessageParser} from './parsers/tepee-message.parser';
import {TepeeMessageAgentParser} from './parsers/tepee-message-agent.parser';

new Surveyor()
    .addParser(ProjectDependencyParser)
    .addParser(TepeeMessageParser)
    .addParser(TepeeMessageAgentParser)
    .run();
