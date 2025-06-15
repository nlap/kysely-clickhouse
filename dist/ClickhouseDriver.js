"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickhouseDriver = void 0;
const ClickhouseConnection_1 = require("./ClickhouseConnection");
class ClickhouseDriver {
    #config;
    constructor(config) {
        this.#config = config;
    }
    async init() { }
    async acquireConnection() {
        return new ClickhouseConnection_1.ClickhouseConnection(this.#config);
    }
    async beginTransaction(conn) {
        return await conn.beginTransaction();
    }
    async commitTransaction(conn) {
        return await conn.commitTransaction();
    }
    async rollbackTransaction(conn) {
        return await conn.rollbackTransaction();
    }
    async releaseConnection(_conn) { }
    async destroy() { }
}
exports.ClickhouseDriver = ClickhouseDriver;
