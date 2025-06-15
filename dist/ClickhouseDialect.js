"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickhouseDialect = void 0;
const kysely_1 = require("kysely");
const ClickhouseDriver_1 = require("./ClickhouseDriver");
const ClickhouseIntrospector_1 = require("./ClickhouseIntrospector");
const ClickhouseAdapter_1 = require("./ClickhouseAdapter");
class ClickhouseDialect {
    #config;
    constructor(config) {
        this.#config = config ?? {};
    }
    createAdapter() {
        return new ClickhouseAdapter_1.ClickhouseAdapter();
    }
    createDriver() {
        return new ClickhouseDriver_1.ClickhouseDriver(this.#config);
    }
    createQueryCompiler() {
        return new kysely_1.MysqlQueryCompiler();
    }
    createIntrospector(db) {
        return new ClickhouseIntrospector_1.ClickhouseIntrospector(db);
    }
}
exports.ClickhouseDialect = ClickhouseDialect;
