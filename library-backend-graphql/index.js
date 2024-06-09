import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import 'dotenv/config'
import './db/index.js'
import Book from './models/'

const typeDefs = `
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type Query {
    bookCount: Int!
    authorCount : Int!
    allBooks(author:String,genre:String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]! 
    ): Book
    editAuthor(name:String!, setBornTo:Int!) : Author
  }
`

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (_, args) => {
      if (!args.author && !args.genre) return books

      const filteredBooks = books.filter(book => {
        const authorMatch = !args.author || book.author === args.author
        const genreMatch = !args.genre || book.genres.includes(args.genre)

        return authorMatch && genreMatch
      })

      return filteredBooks > 0 ? filteredBooks : null
    },
    allAuthors: () => authors
  },
  Author: {
    bookCount: root => {
      return books.filter(b => b.author === root.name).length
    }
  },
  Mutation: {
    addBook: (_, args) => {
      const book = { ...args, id: uuid() }
      const authorExists = authors.some(a => a.name === args.author)
      if (!authorExists) {
        const newAuthor = { name: args.author, id: uuid() }
        authors = authors.concat(newAuthor)
      }
      books = books.concat(book)
      return book
    },
    editAuthor: (_, args) => {
      const author = authors.find(a => a.name === args.name)
      if (!author) {
        return null
      }

      const modifiquedAuthor = { ...author, born: args.setBornTo }
      authors = authors.map(a => (a.name === args.name ? modifiquedAuthor : a))
      return modifiquedAuthor
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 }
})
console.log(`Server ready at ${url}`)
