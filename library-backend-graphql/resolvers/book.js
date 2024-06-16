import Book from '../models/book.js';
import Author from '../models/author.js';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

export const resolvers = {
  Query: {
    bookCount: async () => {
      const allBooks = await Book.find({});
      return allBooks.length;
    },
    allBooks: async (_, args) => {
      if (!args.author && !args.genre) {
        return await Book.find({});
      }

      const booksFound = await Book.find({ genres: { $in: [args.genre] } });
      return booksFound;
    }
  },
  Mutation: {
    addBook: async (_, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('User is not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      let author = await Author.findOne({ name: args.author });
      if (!author) {
        author = new Author({ name: args.author });
      }
      const book = new Book({ ...args, author: author._id });
      author.bookCount = author.bookCount.concat(book);
      await author.save();
      await book.save();
      const bookWithAuthor = await Book.findById(book._id).populate('author');

      pubsub.publish('BOOK_ADDED', { bookAdded: bookWithAuthor });

      return bookWithAuthor;
    }
  },
  Book: {
    author: async root => {
      const author = await Author.findById(root.author);
      return {
        name: () => author.name,
        id: () => author.id,
        born: () => author.born
      };
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  }
};
