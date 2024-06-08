import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'

const Books = (props) => {
  const { loading, error, data } = useQuery(ALL_BOOKS)

  if (!props.show) {
    return null
  }

  if (loading) {
    return (
      <div>Loading...</div>
    )
  }

  const books = data?.allBooks && [...data.allBooks]

  return (
    <div>
      <h2>Books</h2>

      <table>
        <tbody>
          <tr>
            <th> </th>
            <th>Author</th>
            <th>Published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
