const { randomUUID } = require('crypto')
const express = require('express')

const users = []

const app = express()


app.use(express.json())

/**
 * cpf - string
 * name - string
 * id - uuid
 * statement []
 */

app.post('/account', (req, res) => {
  const { cpf, name } = req.body

  const userAlreadyExists = users.some(user => user.cpf === cpf)

  if (userAlreadyExists) {
    return res.status(400).json({ message: 'User already exists!'})
  }

  users.push({
    cpf,
    name,
    id: randomUUID(),
    statement: []
  })

  res.status(201).send()
})

app.get('/statement', (req, res) => {
  const { cpf } = req.headers

  console.log(cpf)

  const user = users.find(user => user.cpf === cpf)

  if (!user) {
    return res.status(404).json({ error: 'User not found'})
  }
  
  return res.json(user.statement)
})

app.listen(3333, console.log('listening on port 3333'))