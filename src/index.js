const { randomUUID } = require('crypto')
const express = require('express')

const customers = []

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

  const id = randomUUID()

  customers.push({
    cpf,
    name,
    id,
    statement: []
  })
  
  res.status(201).json(id)
})

app.listen(3333, console.log('listening on port 3333'))