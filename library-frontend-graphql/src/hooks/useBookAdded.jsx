import { useApolloClient, useSubscription } from '@apollo/client'
import {
  ALL_AUTHORS,
  ALL_BOOKS,
  ALL_BOOKS_BY_GENRE,
  BOOK_ADDED
} from '../queries'
import { toast } from 'react-toastify'

const useBookAdded = () => {
  const client = useApolloClient()

  const authorsInStore = client.readQuery({ query: ALL_AUTHORS })

  const booksInStore = client.readQuery({ query: ALL_BOOKS })

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      if (data.data.bookAdded.title) {
        toast(`New book ${data.data.bookAdded.title} added`)
        const authorExists = authorsInStore.allAuthors.some(
          a => a.name === data.data.bookAdded.author.name
        )
        if (!authorExists) {
          client.writeQuery({
            query: ALL_AUTHORS,
            data: {
              allAuthors: authorsInStore.allAuthors.concat(
                data.data.bookAdded.author
              )
            }
          })
        }

        client.writeQuery({
          query: ALL_BOOKS,
          data: {
            allBooks: booksInStore.allBooks.concat(data.data.bookAdded)
          }
        })

        data.data.bookAdded.genres.forEach(genre => {
          const booksByGenre = client.readQuery({
            query: ALL_BOOKS_BY_GENRE,
            variables: { genre }
          })
          client.writeQuery({
            query: ALL_BOOKS_BY_GENRE,
            variables: { genre },
            data: {
              allBooks: booksByGenre.allBooks.concat(data.data.bookAdded)
            }
          })
        })
      }
    }
  })

  return client
}

export default useBookAdded
