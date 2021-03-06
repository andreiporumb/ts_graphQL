const { gql } = require('apollo-server')

const userTypeDefs = gql`
  input UserInputType {
    id: Int!
    firstName: String
    lastName: String
  }

  type User {
    id: ID!
    userName: String
    firstName: String
    lastName: String
    rights: [String!]
  }

  input UserFilterInput {
    firstName: String
    lastName: String
  }

  type UserList {
    values: [User!]!
    pagination(pager: PagerInput!, filters: UserFilterInput): Pagination
  }

  extend type Query {
    userData(id: ID, externalId: ID): User
    userList(pager: PagerInput!, filters: UserFilterInput): UserList!
  }

  # Not working! Only for demonstration
  extend type Mutation {
    updateUser(input: UserInputType!): String
  }

  # Not working! Only for demonstration
  extend type Subscription {
    userChanged: String
  }
`

module.exports = userTypeDefs
