import { useQuery } from '@apollo/client'
import { ALL_AUTHORS } from '../queries'

const Authors = props => {
  const { loading, error, data } = useQuery(ALL_AUTHORS)

  if (!props.show) {
    return null
  }

  if (loading) {
    return (
      <div>Loading...</div>
    )
  }
  const authors = data?.allAuthors && [...data.allAuthors]
  return (
    <div>
      <h2>Authors</h2>
      <table>
        <tbody>
          <tr>
            <th> </th>
            <th>Born</th>
            <th>books</th>
          </tr>
          {authors?.map(a => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Authors
