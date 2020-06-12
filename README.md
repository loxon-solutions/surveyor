![Surveyor](documentation/surveyor.png)

Surveyor is a tool to parse a project and create documentation diagrams (like maps for the software) automatically. Diagrams are represented internally as a graph, and this graph can be exported in various formats.

## Features

- Export to PUML notation
- Export to Neo4J database
- Extendible with new parsers and writers
- Job queue mechanism, parsers can push new elements to the queue.
- Parameters can be read from file (where secrets can be kept)

## Usage

1. Install this library
    ```shell script
    npm install --save {TODO}
    ```
2. Create index.ts file in your project
    ```typescript
    new Surveyor()
        .addParser(ProjectDependencyParser)
        .addParser(TepeeMessageParser)
        .addParser(TepeeMessageAgentParser)
        .run();
    ```   
   In this file, you have to add your custom parsers and writers. (PUML and Neo4J writer is added by default, together with a sample maven dependency tree parser).
   
3. Execute your program:
    ```shell script
    npm start -- --help
    ```

## Contribution

Contributions are welcome, just create a pull request.

- [Architecture](documentation/architecture.md)
- [TODO](documentation/todo.md)
