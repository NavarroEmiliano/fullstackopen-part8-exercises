export const typeDef = `
extend type Query {
    me: User
}
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

    type Token {
  value: String!
  }

  extend type Mutation {
      createUser(
    username: String!
    favoriteGenre: String!
  ): User
  login(
    username: String!
    password: String!
  ): Token
  }
`
