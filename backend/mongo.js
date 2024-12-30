const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://elenac:${password}@uhpart3.5zshy.mongodb.net/phonebook?retryWrites=true&w=majority&appName=UHPart3`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length == 3) {
  Person
  .find({})
  .then(persons=> {
    console.log("Phonebook:")
    persons.forEach(p => {
      console.log(`${p.name} ${p.number}`)})
    mongoose.connection.close()
  })

  process.exit(0)
}

if (process.argv.length < 5) {
  console.log("Error provide password, name and number")
}

const person = new Person({
  name: process.argv[3],
  number: process.argv[4],
})

person.save().then(result => {
  console.log('note saved!')
  mongoose.connection.close()
})