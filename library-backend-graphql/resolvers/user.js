import User from '../models/user.js';
import jwt from 'jsonwebtoken';

export const resolvers = {
  Query: {
    me: (_, __, { currentUser }) => currentUser
  },
  Mutation: {
    createUser: async (_, args) => {
      try {
        const user = new User({ ...args });
        await user.save();
        return user;
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'BAD_USER_INPUT', invalidArgs: args }
        });
      }
    },
    login: async (_, args) => {
      const user = await User.findOne({ username: args.username });
      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      const userForToken = {
        username: user.username,
        id: user._id
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    }
  }
};
