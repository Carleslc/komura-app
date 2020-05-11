import { BigIntResolver, DateTimeResolver } from 'graphql-scalars';

export const resolvers = {
  BigInt: BigIntResolver,
  DateTime: DateTimeResolver
};
