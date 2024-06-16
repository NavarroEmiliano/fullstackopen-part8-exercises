import { typeDef as User } from './user.js'
import { typeDef as Book } from './book.js'
import { typeDef as Author } from './author.js'

const Query = `
  type Query {
  _type:String
  }
`

const Mutation = `
  type Mutation {
    _empty:String
  }
`

const Subscription = `
type Subscription {
  _empty:String
}`

export const typeDefs = [
  Query,Mutation,Subscription,Author,Book,User
]
