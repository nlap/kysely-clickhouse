import { DatabaseIntrospector, DatabaseMetadata, DatabaseMetadataOptions, Kysely, SchemaMetadata, TableMetadata } from 'kysely';
export declare class ClickhouseIntrospector implements DatabaseIntrospector {
    #private;
    constructor(db: Kysely<any>);
    getSchemas(): Promise<SchemaMetadata[]>;
    getTables(options?: DatabaseMetadataOptions): Promise<TableMetadata[]>;
    getMetadata(options?: DatabaseMetadataOptions): Promise<DatabaseMetadata>;
}
