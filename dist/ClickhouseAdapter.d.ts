import { DialectAdapterBase, Kysely, MigrationLockOptions } from "kysely";
export declare class ClickhouseAdapter extends DialectAdapterBase {
    get supportsTransactionalDdl(): boolean;
    get supportsReturning(): boolean;
    acquireMigrationLock(_db: Kysely<any>, _opt: MigrationLockOptions): Promise<void>;
    releaseMigrationLock(_db: Kysely<any>, _opt: MigrationLockOptions): Promise<void>;
}
