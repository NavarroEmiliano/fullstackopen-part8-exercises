import { gql } from '@apollo/client'

export const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title
    author {
      name
      born
      id
    }
    published
    genres
    id
  }
`

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      id
    }
  }
`

export const ALL_BOOKS_BY_GENRE = gql`
  query allBooksByGenre($genre: String) {
    allBooks(genre: $genre) {
      ...BookDetails
    }
  }

  ${BOOK_DETAILS}
`

export const ALL_BOOKS = gql`
  query {
    allBooks {
    ...BookDetails
    }
  }
 ${BOOK_DETAILS}
`

export const ADD_BOOK = gql`
  mutation AddBook(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`

export const EDIT_AUTHOR = gql`
  mutation EditAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      born
      id
      name
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

export const USER_LOGGED = gql`
  query {
    me {
      username
      favoriteGenre
      id
    }
  }
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`
