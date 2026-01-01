import { SqlGetError } from "../../utils/sql_get_error.ts";
import { sql, type SqlFunction, type SqlStatement } from "./database.ts";

type BaseModel = Record<string, any>;

type JointModel<M> = M & {
  pk(): string;
};

export type ModelJoins<Model extends BaseModel> = {
  [K in keyof Model as NonNullable<Model[K]> extends object ? K : never]?: () => JointModel<
    Model[K] extends Array<infer E> ? E : Model[K]
  >;
};

export interface BaseQuery<Model extends BaseModel> {
  /** determines if the query should get multiple records from the DB or just one */
  all?: boolean;
  /** a method that should return a new instance of the Model for the Query */
  model(): Model;
  /** a SQL statement produced by the given sql function that will be used for retrieving the data for the model */
  statement(sql: SqlFunction): SqlStatement;
  /** optionally if the statement contains JOIN statements this function should return a dictionary of joined models generators */
  joins?(): ModelJoins<Model>;
}

export interface Query<Model extends BaseModel> extends BaseQuery<Model> {
  all?: false;
}

export interface QueryAll<Model extends BaseModel> extends BaseQuery<Model> {
  all: true;
}

export async function handleQuery<Model extends BaseModel>(query: Query<Model>): Promise<Model>;
export async function handleQuery<Model extends BaseModel>(query: QueryAll<Model>): Promise<Model[]>;
export async function handleQuery<Model extends BaseModel>(
  query: Query<Model> | QueryAll<Model>,
): Promise<Model | Model[]> {
  if (query.all) {
    const stm = query.statement(sql);
    const result = await stm.getAll();

    if (query.joins != null) {
      return mapDbResponseWithJoins(query, result);
    } else {
      return result.map((resEntry) => {
        const model = query.model();
        mapDbResponse(model, resEntry);
        return model;
      });
    }
  } else {
    const stm = query.statement(sql);

    if (query.joins != null) {
      const result = await stm.getAll();
      if (result.length === 0) {
        throw new SqlGetError(stm.query);
      }

      const joined = mapDbResponseWithJoins(query, result);
      if (joined.length != 1) {
        throw new Error("database response contains more than one row when only one was expected");
      }
      return joined[0]!;
    } else {
      const result = await stm.get();
      const model = query.model();
      mapDbResponse(model, result);

      return model;
    }
  }
}

function mapDbResponseWithJoins<M extends BaseModel>(query: BaseQuery<M>, results: unknown[]) {
  const PK = "ID";
  const grouped: Array<Record<string, any>[]> = [];

  for (let i = 0; i < results.length; i++) {
    const elem = results[i]! as Record<string, any>;

    const elemPk = elem[PK];
    const group = grouped.find((g) => g[0]![PK] === elemPk);
    if (group) {
      group.push(elem);
    } else {
      grouped.push([elem]);
    }
  }

  const joinModelsGenerators = query.joins!();

  const resModels: M[] = [];
  for (let i = 0; i < grouped.length; i++) {
    const group = grouped[i]!;

    const model = query.model();
    resModels.push(model);

    const modelKeys = Object.keys(model);
    for (let i = 0; i < modelKeys.length; i++) {
      const key = modelKeys[i]!;
      if (Object.hasOwn(group[0]!, key)) {
        set(model, key, group[0]![key]);
      } else {
        if (Object.hasOwn(joinModelsGenerators, key)) {
          const getJoinModel = joinModelsGenerators[key as keyof typeof joinModelsGenerators]!;
          const jointModels: any[] = [];
          for (let i = 0; i < group.length; i++) {
            const row = group[i]!;
            const jmodel = getJoinModel() as any as JointModel<Record<string, any>>;
            mapDbResponse(jmodel, row);

            const pk = jmodel.pk();
            const pkValue = jmodel[pk];

            if (!pkValue) {
              jointModels.push(null);
            } else {
              const isAlreadyMapped = jointModels.some(m => m[pk] === pkValue);
              if (!isAlreadyMapped) {
                jointModels.push(jmodel);
              }
            }
          }

          if (Array.isArray(model[key]) || jointModels.length > 1) {
            set(model, key, jointModels.filter(Boolean));
          } else if (jointModels.length > 0) {
            set(model, key, jointModels[0]);
          }
        } else {
          throw new TypeError(`model key not present in the database response: ${key}`);
        }
      }
    }
  }

  return resModels;
}

function isValidSqlResult(o: unknown): o is Record<string, any> {
  return typeof o === "object" && o !== null;
}

function mapDbResponse(model: BaseModel, result: unknown) {
  if (!isValidSqlResult(result)) {
    throw new TypeError("sql query result is of invalid type");
  }

  const modelKeys = Object.keys(model);
  for (let i = 0; i < modelKeys.length; i++) {
    const key = modelKeys[i]!;
    if (!Object.hasOwn(result, key)) {
      throw new TypeError(`model key not present in the database response: ${key}`);
    }
    set(model, key, result[key]);
  }

  return model;
}

function set(obj: object, key: string, value: any) {
  // @ts-expect-error
  obj[key] = value;
}
