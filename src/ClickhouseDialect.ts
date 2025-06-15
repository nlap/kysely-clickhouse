import {
  DatabaseIntrospector,
  Dialect,
  Driver,
  Kysely,
  MysqlQueryCompiler,
  QueryCompiler,
} from "kysely";

import { ClickhouseDriver } from "./ClickhouseDriver";
import { ClickhouseIntrospector } from "./ClickhouseIntrospector";
import { ClickhouseAdapter } from "./ClickhouseAdapter";
import { WebClickHouseClientConfigOptions } from "@clickhouse/client-web/dist/config";

export interface ClickhouseDialectConfig {
  options?: WebClickHouseClientConfigOptions;
}

export class ClickhouseDialect implements Dialect {
  #config: ClickhouseDialectConfig;

  constructor(config?: ClickhouseDialectConfig) {
    this.#config = config ?? {};
  }

  createAdapter() {
    return new ClickhouseAdapter();
  }

  createDriver(): Driver {
    return new ClickhouseDriver(this.#config);
  }

  createQueryCompiler(): QueryCompiler {
    return new MysqlQueryCompiler();
  }

  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new ClickhouseIntrospector(db);
  }
}
