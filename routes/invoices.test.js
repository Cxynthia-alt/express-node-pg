process.env.NODE_ENV === 'test'
const request = require('supertest')

const app = require('../app')
const db = require('../db')

let testInvoice

beforeEach(async () => {
  const result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES('ibm', '500') RETURNING id, comp_code, amt, paid, add_date, paid_date`)
  testInvoice = result.rows[0]
})

afterEach(async () => {
  await db.query(`DELETE FROM invoices`)
})

afterAll(async () => {
  await db.end()
})

describe("GET /invoices", () => {
  test("Get a list of invoices", async () => {
    const res = await request(app).get('/invoices')
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ invoices: [testInvoice] })
  })
})
