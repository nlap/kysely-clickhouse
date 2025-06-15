import { DatabaseIntrospector, Dialect, Driver, Kysely, QueryCompiler } from "kysely";
import { ClickhouseAdapter } from "./ClickhouseAdapter";
import { WebClickHouseClientConfigOptions } from "@clickhouse/client-web/dist/config";
export interface ClickhouseDialectConfig {
    options?: WebClickHouseClientConfigOptions;
}
export declare class ClickhouseDialect implements Dialect {
    #private;
    constructor(config?: ClickhouseDialectConfig);
    createAdapter(): ClickhouseAdapter;
    createDriver(): Driver;
    createQueryCompiler(): QueryCompiler;
    createIntrospector(db: Kysely<any>): DatabaseIntrospector;
}
