import { CompiledQuery, DatabaseConnection, QueryResult } from "kysely";
import { ClickhouseDialectConfig } from ".";
export interface PreparedQuery {
    query: string;
    query_params: Record<string, unknown>;
}
export declare class ClickhouseConnection implements DatabaseConnection {
    #private;
    constructor(config: ClickhouseDialectConfig);
    prepareQuery<O>(compiledQuery: CompiledQuery): PreparedQuery;
    executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>>;
    beginTransaction(): Promise<void>;
    commitTransaction(): Promise<void>;
    rollbackTransaction(): Promise<void>;
    streamQuery<O>(compiledQuery: CompiledQuery, chunkSize: number): AsyncIterableIterator<QueryResult<O>>;
}
