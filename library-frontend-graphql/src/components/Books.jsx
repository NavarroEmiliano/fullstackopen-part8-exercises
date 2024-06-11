import { useLazyQuery, useQuery } from '@apollo/client'
import { ALL_BOOKS, ALL_BOOKS_BY_GENRE } from '../queries'
import { useEffect, useState } from 'react'

const Books = props => {
  const [genre, setGenre] = useState(null)
  const { loading, error, data } = useQuery(ALL_BOOKS)
  const [booksByGenre, result] = useLazyQuery(ALL_BOOKS_BY_GENRE)

  useEffect(() => {
    if (genre) {
      booksByGenre({ variables: { genre } })
    }
  }, [genre]) // eslint-disable-line

  if (error) {
    props.notify(error)
  }

  if (!props.show) {
    return null
  }

  if (loading || result.loading) {
    return <div>Loading...</div>
  }

  const books = data?.allBooks
    ? genre
      ? result?.data?.allBooks
      : data.allBooks
    : undefined

  /* Obtener generos sin repetir */
  const genres = data?.allBooks && [
    ...new Set(data.allBooks.flatMap(b => b.genres))
  ]

  return (
    <div>
      <h2>Books</h2>
      <>
        {genres?.map(g => (
          <button onClick={() => setGenre(g)} key={g}>
            {g}
          </button>
        ))}
        <button onClick={() => setGenre(null)}>All genres</button>
      </>
      <table>
        <tbody>
          <tr>
            <th> </th>
            <th>Author</th>
            <th>Published</th>
          </tr>
          {books?.map(b => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
