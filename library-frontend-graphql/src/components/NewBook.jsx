import { useMutation } from '@apollo/client'
import { useState } from 'react'
import {
  ADD_BOOK
} from '../queries'
import { toast } from 'react-toastify'

const NewBook = props => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [addBook] = useMutation(ADD_BOOK, {
    onError: error => {
      const message = error.graphQLErrors[0].message
      toast.error(message)
    }
  })

  if (!props.show) {
    return null
  }

  const submit = async event => {
    event.preventDefault()

    addBook({
      variables: {
        title,
        author,
        published: +published,
        genres
      }
    })

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          Title{' '}
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          Author{' '}
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          Published{' '}
          <input
            type='number'
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type='button'>
            Add genre
          </button>
        </div>
        <div>Genres: {genres.join(' ')}</div>
        <button type='submit'>Create book</button>
      </form>
    </div>
  )
}

export default NewBook
