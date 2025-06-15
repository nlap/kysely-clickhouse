import { DatabaseConnection, Driver } from 'kysely';
import { ClickhouseDialectConfig } from '.';
import { ClickhouseConnection } from './ClickhouseConnection';
export declare class ClickhouseDriver implements Driver {
    #private;
    constructor(config: ClickhouseDialectConfig);
    init(): Promise<void>;
    acquireConnection(): Promise<DatabaseConnection>;
    beginTransaction(conn: ClickhouseConnection): Promise<void>;
    commitTransaction(conn: ClickhouseConnection): Promise<void>;
    rollbackTransaction(conn: ClickhouseConnection): Promise<void>;
    releaseConnection(_conn: ClickhouseConnection): Promise<void>;
    destroy(): Promise<void>;
}
