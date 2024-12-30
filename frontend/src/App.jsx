import { useState, useEffect } from 'react'
import personService from './services/notes'

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newFilter, setNewFilter] = useState('')
  const [message, setMessage] = useState({message: null, 
                                          noti: true})

  useEffect(() => {
    personService.getAll()
      .then(response => {
        setPersons(response)
      })
  }, [])

  const remove = (person) => {
    if (!window.confirm('Delete ' + person.name + '?')) {
      return
    }

    personService
    .remove(person.id)
    .then(response => setPersons(persons.filter(cur_person => cur_person.id != person.id)))
  }

  const notify = (message) => {
    setMessage({message, noti: true})
    setTimeout(() => {
      setMessage({message: null, noti: true})
    }, 5000)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    let person = persons.find((cur_element) => {
      return cur_element.name === newName
    })

    if (person != undefined) {
      if (!window.confirm(`${newName} is already added to phonebook, replace the old number with the new one?`)) {
        return
      }
      personService
        .update(person.id, {...person, number: newNumber})
        .then((person) => {
          setPersons(persons.map(c_p => c_p.id === person.id ? person : c_p))
          setNewName('')
          setNewNumber('')
          notify(`${person.name}'s number changed successfully`)
        })
        .catch(error => {
          setMessage({message: `${person.name}'s information has already been deleted from the server`, noti: false})
          setPersons(persons.filter(c_p => {return c_p.id != person.id}))
        }
      )
      
      return
    }

    const newPerson = {
      name: newName,
      number: newNumber
    }

    personService
      .create(newPerson)
      .then((response) => {
        setPersons(persons.concat(response))
        setNewName('')
        setNewNumber('')
        notify(`${response.name} added to the phonebook`)
      })
    
  }

  return (
    <div>
      <h2>Phonebook</h2>
        <Notification message = {message.message} warning={!message.noti}/>
        <Filter filter = {{value: newFilter, funct: setNewFilter}}/>
      <h2>Add a new</h2>
        <PersonForm handleSubmit = {handleSubmit} name = {{value: newName, funct: setNewName}} number = {{value: newNumber, funct: setNewNumber}}/>
      <h2>Numbers</h2>
        <ShowPersons persons = {persons} filter = {newFilter} remove = {remove}/>
    </div>
  )
}

const Filter = ({filter}) => {
    return (
    <div>
      filter shown with: <input value = {filter.value} onChange={(event) => filter.funct(event.target.value.toLowerCase())}/>
    </div>)
}

const Notification = ({message, warning}) => {
  if (message == null) {
    return null
  }

  const notiStyle = {
    color: 'green',
    background: 'lightgreen',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  }

  const warningStyle = {...notiStyle, color: 'red', background: 'lightgray'}
  return (
  <div style={warning ? warningStyle : notiStyle}>
    {message}
  </div>)
}

const Person = ({person, remove}) => {
  return (
    <tr>
      <td>{person.name}</td>
      <td>{person.number}</td>
      <td><button onClick = {() => remove(person)}> Delete </button></td>
      
    </tr>
  )
}

const PersonForm = (props) => {
  return (
    <form onSubmit={props.handleSubmit}>
      <div>
        name: <input value = {props.name.value} onChange={(event) => props.name.funct(event.target.value)}/>
      </div>
      <div>
        number: <input value = {props.number.value} onChange={(event) => props.number.funct(event.target.value)}/>
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const ShowPersons = ({persons, filter, remove}) => {
  return (
    <table>
      <tbody>
        {persons.filter((person) => {
          const inLowerCase = person.name.toLowerCase()
          return inLowerCase.includes(filter)
        })
        .map((person) => 
                          <Person key = {person.name} person={person} remove={remove}/>
              )
        }
      </tbody>
    </table>
  )
}

export default App