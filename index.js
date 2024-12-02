const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const app = express()

app.use(express.json())

app.use(morgan('tiny'))

app.use(cors())

const max = 1000;

let people = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const nameExists = (name) => {
  return people.some(person => person.name == name)
}

app.get('/api/persons', (request, response) => {
  response.json(people)
})

app.get('/info', (request, response) => {
    const now = new Date();
    response.send(`Phonebook has info for ${people.length} people
        <br/>
        <br/>
        ${now.toString()}`)
})

app.get('/api/persons/:id', (request, response) => {
  const person = people.find(person => person.id === request.params.id)
  if (person) {
    response.json(person)
  } else {
    console.log('No person with that id was found')
    response.status(404).end()
  }
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  } else if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  } else if (nameExists(body.name)) {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: String(Math.floor(Math.random() * max))
  }

  people = people.concat(person)

  response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  people = people.filter(person => person.id !== request.params.id)

  response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})