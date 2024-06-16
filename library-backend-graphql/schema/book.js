export const typeDef = `
  extend type Query {
  bookCount:Int!
  allBooks(author:String,genre:String): [Book!]!
  }

     type Book {
        title: String!
        published: Int!
        author: Author!
        id: ID!
        genres: [String!]!
      }

  extend type Mutation{
      addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]! 
    ): Book
  }

  extend type Subscription{
    bookAdded: Book!
  }
  `
