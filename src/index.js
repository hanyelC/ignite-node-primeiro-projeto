const { randomUUID } = require('crypto')
const express = require('express')

/**
 * cpf - string
 * name - string
 * id - uuid
 * statement []
 */

const users = []

const app = express()

app.use(express.json())


function verifyIfExistsAccountCPF(req, res, next) {
  const { cpf } = req.headers

  const user = users.find(user => user.cpf === cpf)

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  req.user = user

  return next()
}

function getBalance(statement = []) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === 'credit') {
      return acc + operation.amount
    } else {
      return acc - operation.amount
    }
  }, 0)

  return balance
}

app.post('/account', (req, res) => {
  const { cpf, name } = req.body

  const userAlreadyExists = users.some(user => user.cpf === cpf)

  if (userAlreadyExists) {
    return res.status(400).json({ message: 'User already exists!' })
  }

  users.push({
    cpf,
    name,
    id: randomUUID(),
    statement: []
  })

  res.status(201).send()
})

app.get('/statement', verifyIfExistsAccountCPF, (req, res) => {
  const { statement } = req.user

  return res.json(statement)
})

app.post('/deposit', verifyIfExistsAccountCPF, (req, res) => {
  const { description, amount } = req.body

  const user = req.user

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit'
  }

  user.statement.push(statementOperation)

  return res.status(201).send()
})

app.post('/withdraw', verifyIfExistsAccountCPF, (req, res) => {
  const { amount } = req.body
  const { user } = req

  const balance = getBalance(user.statement)

  if (balance < amount) {
    return res.status(400).json({ error: "Insufficient funds!" })
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: 'debit'
  }

  user.statement.push(statementOperation)

  return res.status(201).send()
})

app.get('/statement/date', verifyIfExistsAccountCPF, (req, res) => {
  const { date } = req.query
  const { user } = req

  const dateFormat = new Date(date + " 00:00")

  const statement = user.statement.filter(
    (statement) =>
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
  )

  return res.json(statement)
})

app.put('/account', verifyIfExistsAccountCPF, (req, res) => {
  const { name } = req.body
  const { user } = req

  user.name = name

  return res.status(201).send()
})

app.get('/account', verifyIfExistsAccountCPF, (req, res) => {
  const { user } = req

  return res.json(user)
})

app.delete('/account', verifyIfExistsAccountCPF, (req, res) => {
  const { user } = req

  users.splice(user, 1)

  return res.status(204).send()
})

app.get('/balance', verifyIfExistsAccountCPF, (req, res) => {
  const { user } = req

  const balance = getBalance(user.statement)

  return res.json(balance)
})

app.listen(3333, console.log('listening on port 3333'))