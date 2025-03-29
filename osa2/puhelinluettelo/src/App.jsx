import { useState, useEffect } from 'react'
import personsService from './persons'
import './App.css'

const Filter = ({filter, handleFilterChange}) => {
  return (
    <div>
        Filter shown with: <input value={filter || ''} onChange={handleFilterChange}/>
    </div>
  )
}

const PersonForm = ({newName, newNumber, handleNameChange, handleNumberChange, addPerson}) => {
  return (
    <form onSubmit={addPerson}>
      <div>
        name: <input value={newName || ''} onChange={handleNameChange}/>
      </div>
      <div>
        number: <input value={newNumber || ''} onChange={handleNumberChange}/>
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = ({persons, deletePerson}) => {
  return (
    <ul>
      {persons.map(person => (
        <li key={person.id}>
        {person.name} - {person.number}
        <button onClick={() => deletePerson(person.id, person.name)}>Delete</button>
        </li>
      ))}
    </ul>
  )
}

const NotificationMessage = ({message, type = 'success'}) => {
  if (message === null) {
      return null
  }

  return (
      <div className={type}>
          {message}
      </div>
  )
}


const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [notificationType, setNotificationType] = useState('success')

  useEffect(() => {
    personsService.getAll()
    .then(initialPersons => {
      setPersons(initialPersons)
    })
    .catch(error => {
      console.error('Error fetching data: ', error)
    })
  }, [])

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }


  const addPerson = (event) => {
    event.preventDefault()

    // Puhelinnumeron muokkaus
    const existingPerson = persons.find(person => person.name === newName)

    if (existingPerson) {
      const confirmUpdate = window.confirm(
      `${newName} is already added to phonebook, replace the old number with the new one?`  
      )

      if (confirmUpdate) {
        const updatedPerson = {...existingPerson, number: newNumber}

        personsService.update(existingPerson.id, updatedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(person => 
              person.id !== existingPerson.id ? person : returnedPerson
            ))
            setNewName('')
            setNewNumber('')
            setNotificationMessage(`Updated ${updatedPerson.name}'s number`)
            setNotificationType('success')

            setTimeout(() => setNotificationMessage(null), 5000)
          })
          .catch(error => {
            console.error('Error updating person:', error)
            setNotificationMessage(`Failed to update ${updatedPerson.name}'s number`)
            setNotificationType('error')
            setTimeout(() => setNotificationMessage(null), 5000)
          })
      }
      return
    }
    
    // Tarkistus onko nimi jo lisätty
    /*if (persons.some(person => person.name === newName)) {
      alert(`${newName} is already added to phonebook`)
      setNewName('')
      setNewNumber('')
      return
    }*/

    const newPerson = {name: newName, number: newNumber}

    personsService.create(newPerson)
    .then(returnedPerson => {
      setPersons([...persons, returnedPerson])
      setNewName('')
      setNewNumber('')
      setNotificationMessage(`Added ${newPerson.name}`)
      setNotificationType('success')

      setTimeout(() => setNotificationMessage(null), 5000)
    })
    .catch(error => {
      console.error('Error adding person: ', error)
      setNotificationMessage({ message: error.response.data.error });
      setNotificationType('error')
      setTimeout(() => setNotificationMessage(null), 5000)
    })
  }

  const deletePerson = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      personsService.remove(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
          setNotificationMessage(`Deleted ${name}`)
          setNotificationType('success')

          setTimeout(() => setNotificationMessage(null), 5000)
        })
        .catch(error => {
          console.error('Error deleting person:', error)
          setNotificationMessage(`Failed to delete ${name}`)
          setNotificationType('error')
          setTimeout(() => setNotificationMessage(null), 5000)
        })
    }
  }

  const filteredPersons = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase()) //Muokataan tekstit samanlaisiksi
  )

  return (
    <div>
      <h2>Phonebook</h2>
      <NotificationMessage message={notificationMessage} type={notificationType} />

      <Filter filter={filter} handleFilterChange={handleFilterChange} />

      <h2>Add a new</h2>
      <PersonForm 
        newName={newName}
        newNumber={newNumber}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
        addPerson={addPerson}
      />

      <h2>Numbers</h2>
      <Persons persons={filteredPersons} deletePerson={deletePerson}/>
    </div>
  )
}

export default App
