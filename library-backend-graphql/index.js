import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
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

      const filteredBooks = books.filter(book => {
        const authorMatch = !args.author || book.author === args.author
        const genreMatch = !args.genre || book.genres.includes(args.genre)

        return authorMatch && genreMatch
      })

      return filteredBooks > 0 ? filteredBooks : null
    }
    //  allAuthors: () => authors
  },
  Author: {
    /*     bookCount: root => {
      return books.filter(b => b.author === root.name).length
    } */
  },
  Book: {
    author:async root => {
      const author = await Author.findById(root.author)
      return {
        name: () => author.name,
        id: () => author.id,
        born: () => author.born,
      }
    }
  },
  Mutation: {
    addBook: async (_, args) => {
      let author = await Author.findOne({ name: args.author })
      if (!author) {
        author = new Author({ name: args.author })
        await author.save()
      }
      const book = new Book({ ...args, author: author._id })
      await book.save()

      const bookWithAuthor = await Book.findById(book._id).populate('author')

      return bookWithAuthor
    },

    addAuthor: (_, args) => {
      const author = new Author({ ...args })
      author.save()
      return author
    },
    editAuthor: (_, args) => {
      /*       const author = authors.find(a => a.name === args.name)
      if (!author) {
        return null
      }

      const modifiquedAuthor = { ...author, born: args.setBornTo }
      authors = authors.map(a => (a.name === args.name ? modifiquedAuthor : a))
      return modifiquedAuthor */
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
