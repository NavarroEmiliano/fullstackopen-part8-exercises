import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { ALL_AUTHORS, ALL_BOOKS, EDIT_AUTHOR } from '../queries'

const UpdateAuthor = props => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_BOOKS }]
  })

  if (!props.show) {
    return null
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
    setName('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          Name{' '}
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          Born{' '}
          <input
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type='submit'>Update Author</button>
      </form>
    </div>
  )
}

export default UpdateAuthor
