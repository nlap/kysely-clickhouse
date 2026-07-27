"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickhouseConnection = void 0;
const client_web_1 = require("@clickhouse/client-web");
const node_crypto_1 = require("node:crypto");
function inlineLiteral(value) {
    if (typeof value === "boolean")
        return value ? "1" : "0";
    if (typeof value === "bigint")
        return value.toString();
    if (Number.isNaN(value))
        return "nan";
    if (value === Number.POSITIVE_INFINITY)
        return "inf";
    if (value === Number.NEGATIVE_INFINITY)
        return "-inf";
    return String(value);
}
function paramType(value) {
    switch (typeof value) {
        case "string":
            return "String";
        case "bigint":
            return "Int64";
        case "boolean":
            return "Bool";
        case "number":
            return Number.isInteger(value) ? "Int64" : "Float64";
    }
    if (value instanceof Date)
        return "DateTime64(3)";
    if (Array.isArray(value)) {
        const element = value.find((v) => v !== null && v !== undefined);
        return `Array(${element === undefined ? "String" : paramType(element)})`;
    }
    return "String";
}
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
        const query_params = {};
        let index = 0;
        const compiledSql = compiledQuery.sql.replace(/\?/g, () => {
            const param = compiledQuery.parameters[index++];
            if (param === null || param === undefined) {
                return "NULL";
            }
            if (typeof param === "number" ||
                typeof param === "bigint" ||
                typeof param === "boolean") {
                return inlineLiteral(param);
            }
            const name = `p${index - 1}`;
            const value = typeof param === "string" ||
                param instanceof Date ||
                Array.isArray(param)
                ? param
                : JSON.stringify(param);
            query_params[name] = value;
            return `{${name}: ${paramType(value)}}`;
        });
        return {
            query: compiledSql.replace(/^update ((`\w+`\.)*`\w+`) set/i, "alter table $1 update"),
            query_params,
        };
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
                const { query, query_params } = this.prepareQuery(compiledQuery);
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
            const { query, query_params } = this.prepareQuery(compiledQuery);
            const resultSet = await this.#client.query({
                query,
                query_params,
                format: "JSONEachRow",
            });
            const data = await resultSet.json();
            return {
                rows: Array.isArray(data) ? data : [],
            };
        }
        if (compiledQuery.query.kind === "UpdateQueryNode") {
            const { query, query_params } = this.prepareQuery(compiledQuery);
            const resultSet = await this.#client.query({
                query,
                query_params,
            });
            const summary = resultSet.response_headers["x-clickhouse-summary"];
            const summaryObject = JSON.parse((Array.isArray(summary) ? summary[0] : summary) ?? "{}");
            return {
                rows: [],
                numAffectedRows: BigInt(summaryObject.written_rows ?? 0),
                numChangedRows: BigInt(summaryObject.written_rows ?? 0),
            };
        }
        const { query, query_params } = this.prepareQuery(compiledQuery);
        await this.#client.command({
            query,
            query_params,
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
        const { query, query_params } = this.prepareQuery(compiledQuery);
        const resultSet = await this.#client.query({
            query,
            query_params,
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
