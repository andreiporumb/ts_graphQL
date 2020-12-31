const { gql } = require('apollo-server-koa')

const rootTypeDefs = gql`
  scalar DateTime
  scalar Byte
  scalar Char
  scalar Upload
  type Query
  type Mutation
  type Subscription

  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`

module.exports = rootTypeDefs
