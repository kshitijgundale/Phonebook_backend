const { request, response } = require('express')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const dotenv = require('dotenv')
dotenv.config()

const app = express()

app.use(express.static('build'))
app.use(cors())
app.use(express.json())

morgan.token('postData', function postData (req) {
    return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'))

app.get('/api/persons', (request, response)=>{
    Person.find({}).then(persons=>{
        response.json(persons)
    })
})

app.get('/info', (request, response)=>{
    Person.find({}).then((persons)=>{
        response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
    })
})

app.get('/api/persons/:id', (request, response, next)=>{
    Person.findById(request.params.id)
        .then((person)=>{
            if(person){
                response.json(person)
            }
            else{
                response.status(404).end()
            }
        })
        .catch((error)=>{next(error)})
})

app.delete('/api/persons/:id', (request, response, next)=>{
    Person.findByIdAndRemove(request.params.id)
        .then((result)=>{
            response.status(204).end()
        })
        .catch((error)=>next(error))
})

app.post('/api/persons', (request, response, next)=>{
    const person = new Person({
        name: request.body.name,
        number: request.body.number
    })

    person.save()
        .then((savedPerson)=>{
            response.json(savedPerson)
        })
        .catch((error)=>next(error))
})

app.put('/api/persons/:id', (request, response, next)=>{
    const person = {
        name: request.body.name,
        number: request.body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, {new: true})
        .then((updatedPerson)=>{
            response.json(updatedPerson)
        })
        .catch(error=>next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    else if(error.name === "ValidationError") {
        return response.status(400).send({error: error.message})
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)

