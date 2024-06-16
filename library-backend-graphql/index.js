import { ApolloServer } from '@apollo/server'
import { GraphQLError } from 'graphql'
import 'dotenv/config'
import './db/index.js'
import Book from './models/book.js'
import Author from './models/author.js'
import User from './models/user.js'
import jwt from 'jsonwebtoken'

import { createServer } from 'http'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { expressMiddleware } from '@apollo/server/express4'

import { makeExecutableSchema } from '@graphql-tools/schema'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import express from 'express'
import cors from 'cors'

import { PubSub } from 'graphql-subscriptions'

const pubsub = new PubSub()

const PORT = process.env.PORT || 4000

const typeDefs = `
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Token {
  value: String!
}

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
    me: User
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
    createUser(
    username: String!
    favoriteGenre: String!
  ): User
  login(
    username: String!
    password: String!
  ): Token
  }
  type Subscription {
  bookAdded: Book!
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
    },
    me: (_, args, { currentUser }) => {
      return currentUser
    }
  },
  Author: {
    bookCount: root => {
      return root.bookCount.length
    }
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
    addBook: async (_, args, { currentUser }) => {
      try {
        if (!currentUser) {
          throw new GraphQLError('User is not authenticated', {
            extensions: {
              code: 'UNAUTHENTICATED'
            }
          })
        }

        if (args.author.length < 4) {
          throw new GraphQLError('Author must be more than 3 letters')
        }

        if (args.title.length < 2) {
          throw new GraphQLError('Title must be more than 1 letters')
        }

        let author = await Author.findOne({ name: args.author })
        if (!author) {
          author = new Author({ name: args.author })
        }
        const book = new Book({ ...args, author: author._id })
        author.bookCount = author.bookCount.concat(book)
        await author.save()
        await book.save()
        const bookWithAuthor = await Book.findById(book._id).populate('author')

        pubsub.publish('BOOK_ADDED', { bookAdded: bookWithAuthor })

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
    editAuthor: async (_, args, { currentUser }) => {
      try {
        if (!currentUser) {
          throw new GraphQLError('User is not authenticated', {
            extensions: {
              code: 'UNAUTHENTICATED'
            }
          })
        }
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
    },
    createUser: async (_, args) => {
      try {
        const user = new User({ ...args })
        await user.save()
        return user
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args
          }
        })
      }
    },
    login: async (_, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }
      const userForToken = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  }
}
const app = express()
const httpServer = createServer(app)

const schema = makeExecutableSchema({ typeDefs, resolvers })
const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose()
          }
        }
      }
    }
  ]
})

const wsServer = new WebSocketServer({
  server: httpServer,

  path: '/graphql'
})

const serverCleanup = useServer({ schema }, wsServer)

const corsOptions = {
  origin: 'http://localhost:5173'
}

app.use(cors(corsOptions))

await server.start()
app.use(
  '/graphql',
  express.json(),
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      const auth = req ? req.headers.authorization : null
      if (auth && auth.toLowerCase().startsWith('bearer ')) {
        const decodedToken = jwt.verify(
          auth.substring(7),
          process.env.JWT_SECRET
        )
        const currentUser = await User.findById(decodedToken.id)
        return { currentUser }
      }
    }
  })
)

httpServer.listen(PORT, () => {
  console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/graphql`)
  console.log(
    `🚀 Subscription endpoint ready at ws://localhost:${PORT}/graphql`
  )
})
