"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickhouseAdapter = void 0;
const kysely_1 = require("kysely");
class ClickhouseAdapter extends kysely_1.DialectAdapterBase {
    get supportsTransactionalDdl() {
        return false;
    }
    get supportsReturning() {
        return true;
    }
    async acquireMigrationLock(_db, _opt) {
    }
    async releaseMigrationLock(_db, _opt) {
    }
}
exports.ClickhouseAdapter = ClickhouseAdapter;
