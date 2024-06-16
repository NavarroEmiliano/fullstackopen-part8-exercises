export const typeDef = `
  extend type Query {
    allAuthors: [Author!]!
  }

    type Author {
      name: String!
      id: ID!
      born: Int
      bookCount: Int!
    }

   extend type Mutation {
   addAuthor(
   name:String!
   born:Int
   ):Author
   editAuthor(name:String!,setBornTo:Int!):Author
  
   } 
  `
