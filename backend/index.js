const Person = require("./modules/person.js")

const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const app = express()

app.use(express.json())

app.use(morgan('dev'))

app.use(cors())

app.use(express.static('dist'))

const max = 1000;

app.get('/api/persons', (request, response) => {
  console.log("Received request in get all")
  Person.find({})
  .then(people => {
    response.json(people)
  })
})

app.get('/info', (request, response) => {
  console.log("Received request in info")
    Person.find({})
    .then(people => {
      const now = new Date();
      response.send(`Phonebook has info for ${people.length} people
          <br/>
          <br/>
          ${now.toString()}`)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  console.log("Received request in get")
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
  console.log("Received request in post")
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

  Person.find({})
  .then(people => {
    if (people.some(person => person.name == body.name)) {
      return response.status(400).json({ 
        error: 'name must be unique' 
      })
    }

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
})



app.put('/api/persons/:id', (request, response, next) => {
  console.log("Received request in put")
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

app.delete('/api/persons/:id', (request, response) => {
  console.log("Received request in delete")
  Person.findByIdAndDelete(request.params.id)
  .then(person => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.log("Error handler called")
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})