"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickhouseConnection = void 0;
const client_web_1 = require("@clickhouse/client-web");
const node_crypto_1 = require("node:crypto");
class ClickhouseConnection {
    #client;
    constructor(config) {
        this.#client = (0, client_web_1.createClient)({
            ...config.options,
            clickhouse_settings: {
                ...config.options?.clickhouse_settings,
                date_time_input_format: "best_effort",
            },
            session_id: (0, node_crypto_1.randomUUID)(),
        });
    }
    prepareQuery(compiledQuery) {
        let i = 0;
        const compiledSql = compiledQuery.sql.replace(/\?/g, () => {
            const param = compiledQuery.parameters[i++];
            if (typeof param === "number") {
                return `${param}`;
            }
            // should never happen
            if (typeof param !== "string") {
                return `'${JSON.stringify(param)}'`;
            }
            return `'${param.replace(/'/gm, `\\'`).replace(/\\"/g, '\\\\"')}'`;
        });
        return compiledSql.replace(/^update ((`\w+`\.)*`\w+`) set/i, "alter table $1 update");
    }
    async executeQuery(compiledQuery) {
        if (compiledQuery.query.kind === "InsertQueryNode") {
            if (compiledQuery.query.values?.kind === "ValuesNode") {
                const values = [
                    compiledQuery.query.columns?.map((c) => c.column.name) ?? [],
                    // @ts-expect-error: fix types
                    ...(compiledQuery.query.values?.values.map((v) => v.values) ?? []),
                ];
                const schema = compiledQuery.query.into?.table?.schema?.name;
                const table = compiledQuery.query.into?.table.identifier.name ?? "";
                const fullQualifiedTable = schema ? `${schema}.${table}` : table;
                const resultSet = await this.#client.insert({
                    table: fullQualifiedTable,
                    format: "JSONCompactEachRowWithNames",
                    values,
                    clickhouse_settings: {
                        date_time_input_format: "best_effort",
                    },
                });
                return {
                    rows: [],
                    numAffectedRows: BigInt(resultSet.summary?.written_rows ?? 0),
                    numChangedRows: BigInt(resultSet.summary?.written_rows ?? 0),
                };
            }
            if (compiledQuery.query.values?.kind === "SelectQueryNode") {
                let counter = 0;
                const query = compiledQuery.sql.replace(/\?/g, () => {
                    const val = compiledQuery.parameters[counter];
                    if (typeof val === "string") {
                        return `{p${counter++}: String}`;
                    }
                    if (typeof val === "number") {
                        return `{p${counter++}: UInt32}`;
                    }
                    if (typeof val === "object" && val instanceof Date) {
                        return `{p${counter++}: DateTime}`;
                    }
                    return `{p${counter++}: String}`;
                });
                const query_params = Object.fromEntries(compiledQuery.parameters.map((val, i) => [`p${i}`, val]));
                await this.#client.command({
                    query,
                    query_params,
                });
                return {
                    rows: [],
                    numAffectedRows: undefined,
                    numChangedRows: undefined,
                };
            }
        }
        if (compiledQuery.query.kind === "SelectQueryNode") {
            const query = this.prepareQuery(compiledQuery);
            const resultSet = await this.#client.query({
                query,
                format: "JSONEachRow",
            });
            const data = await resultSet.json();
            return {
                rows: Array.isArray(data) ? data : [],
            };
        }
        if (compiledQuery.query.kind === "UpdateQueryNode") {
            const query = this.prepareQuery(compiledQuery);
            const resultSet = await this.#client.query({
                query,
            });
            const summary = resultSet.response_headers["x-clickhouse-summary"];
            const summaryObject = JSON.parse((Array.isArray(summary) ? summary[0] : summary) ?? "{}");
            return {
                rows: [],
                numAffectedRows: BigInt(summaryObject.written_rows ?? 0),
                numChangedRows: BigInt(summaryObject.written_rows ?? 0),
            };
        }
        await this.#client.command({
            query: this.prepareQuery(compiledQuery),
            clickhouse_settings: {
                wait_end_of_query: 1,
            },
        });
        return {
            rows: [],
        };
    }
    async beginTransaction() {
        throw new Error("Transactions are not supported.");
    }
    async commitTransaction() {
        throw new Error("Transactions are not supported.");
    }
    async rollbackTransaction() {
        throw new Error("Transactions are not supported.");
    }
    async *streamQuery(compiledQuery, chunkSize) {
        const query = this.prepareQuery(compiledQuery);
        const resultSet = await this.#client.query({
            query,
            format: "JSONEachRow",
        });
        const stream = resultSet.stream();
        for await (const row of stream) {
            yield {
                rows: [row],
            };
        }
    }
}
exports.ClickhouseConnection = ClickhouseConnection;
