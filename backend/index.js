const Person = require('./modules/person.js')

// Import the express module
const express = require('express')

const morgan = require('morgan')

// Will create an express application stored in the app variable
const app = express()

// Express json-parser middleware
// middleware handles response and request objects
// defines the body parameter of the request with an object, before the request handler is called
app.use(express.json())

app.use(morgan('tiny'))

// This configures express to show static content. When an HTTP GET is received, Express will first check in the dist directory (the argument we gave it), to see if there is a file corresponding with the request and returns it if there is such a file.
app.use(express.static('dist'))

const max = 1000

// Define an event handler that will be called everytime the app gets a GET request made to /api/persons
app.get('/api/persons', (request, response) => {
  console.log('Received request in get all')
  Person.find({})
    .then(people => {
      response.json(people)
    })
})

app.get('/info', (request, response) => {
  console.log('Received request in info')
  Person.find({})
    .then(people => {
      const now = new Date()
      response.send(`Phonebook has info for ${people.length} people
          <br/>
          <br/>
          ${now.toString()}`)
    })
})

// This will be called when the app receives a request to /api/persons/<anything>. <anything> is a string.
// When using the : you are setting a variable, with this the request.params.id variable will be set to <anything>
app.get('/api/persons/:id', (request, response, next) => {
  console.log('Received request in get')
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      console.log('No person with that id was found')
      response.status(404).end()
    }
  })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  console.log('Received request in post')
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

  // Check if there is already a person with that name added

  // First get all of the people added
  Person.find({})
    .then(people => {

      // Check if the name is repeated
      if (people.some(person => person.name === body.name)) {
        return response.status(400).json({
          error: 'name must be unique'
        })
      }

      console.log('Creating person')

      // Create new person
      const person = new Person({
        name: body.name,
        number: body.number,
        id: String(Math.floor(Math.random() * max))
      })


      person.save().then(savedPerson => {
        response.json(savedPerson)
      })
    })
})



app.put('/api/persons/:id', (request, response, next) => {
  console.log('Received request in put')
  Person.findById(request.params.id)
    .then(person => {
      if (!person)
        return response.status(404).end()

      person.name = request.body.name
      person.number = request.body.number

      return person.save().then((newPerson) => {
        response.json(newPerson)
      })
    })
    .catch(error => next(error))
}
)

app.delete('/api/persons/:id', (request, response, next) => {
  console.log('Received request in delete')
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log('Error handler called')
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

// Use port defined in the environment variable PORT (so that it can be used on render)
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})