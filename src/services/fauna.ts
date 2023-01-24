import { Client } from 'faunadb'

export const fauna = new Client({
  secret: process.env.FAUNADB_KEY, // dar acesso ao banco de dados da faunaDB.
})