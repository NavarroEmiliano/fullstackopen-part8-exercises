import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { GraphQLError } from 'graphql'
import 'dotenv/config'
import './db/index.js'
import Book from './models/book.js'
import Author from './models/author.js'

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
    addAuthor(
       name: String!
      born: Int
    ): Author
  }
`

const resolvers = {
  Query: {
    bookCount: async () => {
      const allBooks = await Book.find({})
      return allBooks.length
    },
    //  authorCount: () => authors.length,
    allBooks: async (_, args) => {
      if (!args.author && !args.genre) {
        const allBooks = await Book.find({})
        return allBooks
      }

      const booksFound = await Book.find({
        genres: { $in: [args.genre] }
      })

      return booksFound
    },
    allAuthors: async () => {
      const allAuthors = await Author.find({})
      return allAuthors
    }
  },
  Author: {
    /*     bookCount: root => {
      return books.filter(b => b.author === root.name).length
    } */
  },
  Book: {
    author: async root => {
      const author = await Author.findById(root.author)
      return {
        name: () => author.name,
        id: () => author.id,
        born: () => author.born
      }
    }
  },
  Mutation: {
    addBook: async (_, args) => {
      try {
        if (args.author.length < 4)
          throw Error('Author must be more than 3 letters')
        if (args.title.length < 2)
          throw Error('Title must be more than 1 letters')
        let author = await Author.findOne({ name: args.author })
        if (!author) {
          author = new Author({ name: args.author })
          await author.save()
        }
        const book = new Book({ ...args, author: author._id })
        await book.save()
        const bookWithAuthor = await Book.findById(book._id).populate('author')

        return bookWithAuthor
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args
          }
        })
      }
    },

    addAuthor: (_, args) => {
      const author = new Author({ ...args })
      author.save()
      return author
    },
    editAuthor: async (_, args) => {
      try {
        const author = await Author.findOne({ name: args.name })
        if (!author) {
          return null
        }
        author.born = args.setBornTo
        await author.save()
        return author
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args
          }
        })
      }
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
