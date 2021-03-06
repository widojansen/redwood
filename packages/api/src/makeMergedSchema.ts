import { mergeSchemas, gql } from 'apollo-server-lambda'
import { GraphQLSchema } from 'graphql'
import { IResolversParameter } from 'graphql-tools'
import merge from 'lodash.merge'
import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date'

export interface TypeDefResolverExports {
  schema: GraphQLSchema
  resolvers: IResolversParameter
}

/**
 * Merge graphql type definitions and resolvers into a single executable schema
 *
 * ```js
 * import * as currentUser from 'src/graphql/currentUser'
 * import * as todo from 'src/graphql/todo'
 *
 * const schema = makeMergedSchema([todo, currentUser])
 * ```
 */
export const makeMergedSchema = (
  schemas: Array<TypeDefResolverExports>
): GraphQLSchema => {
  const rootSchema = gql`
    scalar Date
    scalar Time
    scalar DateTime

    type Redwood {
      version: String
    }

    type Query {
      redwood: Redwood
    }
  `

  const rootResolver = {
    Date: GraphQLDate,
    Time: GraphQLTime,
    DateTime: GraphQLDateTime,
    Query: {
      redwood: () => ({
        version: '0.0.0',
      }),
    },
  }

  return mergeSchemas({
    schemas: [rootSchema, ...schemas.map(({ schema }) => schema)],
    resolvers: [
      rootResolver,
      ...merge(schemas.map(({ resolvers }) => resolvers)),
    ],
  })
}
