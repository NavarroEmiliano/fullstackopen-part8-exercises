import pkg from 'lodash';
const { merge } = pkg;
import { resolvers as authorResolvers } from './author.js'
import { resolvers as bookResolvers } from './book.js'
import { resolvers as userResolvers } from './user.js'

export const resolvers = merge(authorResolvers, bookResolvers, userResolvers)
