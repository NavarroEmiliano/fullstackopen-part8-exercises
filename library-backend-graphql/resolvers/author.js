import Author from '../models/author.js';

export const resolvers = {
  Query: {
    allAuthors: async () => {
      const allAuthors = await Author.find({});
      return allAuthors;
    }
  },
  Mutation: {
    addAuthor: (_, args) => {
      const author = new Author({ ...args });
      author.save();
      return author;
    },
    editAuthor: async (_, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('User is not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      const author = await Author.findOne({ name: args.name });
      if (!author) {
        return null;
      }
      author.born = args.setBornTo;
      await author.save();
      return author;
    }
  },
  Author: {
    bookCount: root => root.bookCount.length
  }
};
