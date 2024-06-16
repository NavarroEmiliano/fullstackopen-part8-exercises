import { useQuery } from '@apollo/client'
import { ALL_BOOKS, USER_LOGGED } from '../queries'

const Recommended = props => {
  const {
    loading: loadingUser,
    error: errorUser,
    data: userData
  } = useQuery(USER_LOGGED)
  const {
    loading: loadingBooks,
    error: errorBooks,
    data: booksData
  } = useQuery(ALL_BOOKS)

  const recommendedBooks =
    booksData && userData.me
      ? booksData.allBooks.filter(b =>
        b.genres.includes(userData.me.favoriteGenre)
      )
      : ''
  if (errorUser || errorBooks) {
    props.notify(errorUser || errorBooks)
  }

  if (!props.show) return null

  if (loadingUser || loadingBooks) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h2>Recommendations</h2>

      <table>
        <tbody>
          <tr>
            <th> </th>
            <th>Author</th>
            <th>Published</th>
          </tr>
          {recommendedBooks?.map(b => (
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

export default Recommended
