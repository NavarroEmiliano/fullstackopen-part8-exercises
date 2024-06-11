import { useMutation, useQuery } from '@apollo/client'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'
import { useState } from 'react'
import Select from 'react-select'

const Authors = props => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const { loading, error, data } = useQuery(ALL_AUTHORS)
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    update: (cache, { data: { editAuthor } }) => {
      cache.updateQuery({ query: ALL_AUTHORS }, ({ allAuthors }) => {
        return {
          allAuthors: allAuthors.map(a =>
            a.name !== editAuthor.name ? a : editAuthor
          )
        }
      })
    }
  })

  const authors = data?.allAuthors && [...data.allAuthors]

  if (!props.show) {
    return null
  }

  if (loading) {
    return <div>Loading...</div>
  }

  const submit = async event => {
    event.preventDefault()

    editAuthor({
      variables: {
        name,
        setBornTo: +born
      }
    })

    setBorn('')
  }

  const options = authors?.map(a => {
    return {
      value: a.name,
      label: a.name
    }
  })

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
      {props.token
        ? (
          <>
            <h2>Set birthyear</h2>
            <form onSubmit={submit}>
              <Select
                options={options}
                onChange={({ value }) => setName(value)}
              />
              <div>
                Born{' '}
                <input
                  value={born}
                  onChange={({ target }) => setBorn(target.value)}
                />
              </div>
              <button type='submit'>Update Author</button>
            </form>
          </>
          )
        : (
            ''
          )}
    </div>
  )
}

export default Authors
