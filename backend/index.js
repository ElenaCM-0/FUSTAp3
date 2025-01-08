const Person = require("./modules/person.js")

const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const app = express()

app.use(express.json())

app.use(morgan('tiny'))

app.use(cors())

app.use(express.static('dist'))

const max = 1000;

const nameExists = (name) => {
  return people.some(person => person.name == name)
}

app.get('/api/persons', (request, response) => {
  Person.find({})
  .then(people => {
    response.json(people)
  })
})

app.get('/info', (request, response) => {
    Person.find({})
    .then(people => {
      const now = new Date();
      response.send(`Phonebook has info for ${people.length} people
          <br/>
          <br/>
          ${now.toString()}`)
    })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    if (person == null) {
      console.log('No person with that id was found')
      response.status(404).end()
    }
    response.json(person)
  })
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
  } 
  /* else if (nameExists(body.name)) {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  } */

  console.log("Creating person")
  const person = new Person({
    name: body.name,
    number: body.number,
    id: String(Math.floor(Math.random() * max))
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id)
  .then(person => {
    response.status(204).end()
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})