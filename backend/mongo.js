// This allows us to use the MongoDB in a more simple way
const mongoose = require('mongoose')

if (process.argv.length != 3 && process.argv.length != 5) {
  console.log('Acceptable arguments are: \
    \npassword \
    \npassword name number')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://elenac:${password}@uhpart3.5zshy.mongodb.net/phonebook?retryWrites=true&w=majority&appName=UHPart3`

mongoose.set('strictQuery',false)

mongoose.connect(url)

// Prepare for working with the database
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length == 3) {
  Person
    .find({})
    .then(persons=> {
      console.log('Phonebook')
      persons.forEach(p => {
        console.log(`${p.name} ${p.number}`)})

      mongoose.connection.close()
    })
} else {
  // Create a new person object following the person model
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })
  
  person
    .save()
    .then(result => {
      console.log(`added ${result.name} number ${result.number} to phonebook`)
    
      mongoose.connection.close()
    })
}