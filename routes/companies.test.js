process.env.NODE_ENV === 'test'

const request = require('supertest')

const app = require('../app')
const db = require('../db')

let testCompany
beforeEach(async() => {
    const result= await db.query(`INSERT INTO companies (code, name, description) VALUES('google','Google','search engine') RETURNING code, name, description`)
    testCompany=result.rows[0]
})

afterEach(async() =>{
    await db.query(`DELETE FROM companies`)
})

afterAll(async() => {
    await db.end()
})


describe("GET /companies",  () => {
    test("Get a list of companies", async() => {
        const res = await request(app).get('/companies')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({companies:[testCompany]})
        })
})

describe("GET /companies/:code",  () => {
    test("Get a single company", async() => {
        const res = await request(app).get(`/companies/${testCompany.code}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({company:testCompany})
        })
    test("Respond with 404 for invalid code", async() => {
    const res = await request(app).get(`/companies/0`)
    expect(res.statusCode).toBe(404)
    })
})

describe("POST /companies", () => {
    test("Create a new company", async() => {
        const res = await request(app).post('/companies/').send({code:'reddit', name:'Reddit', description:'social news website'})
        expect(res.statusCode).toBe(201)
        expect(res.body).toEqual({
            company:{code:'reddit', name:'Reddit', description:'social news website'}
        })
        
    })
})

describe("PATCH /companies/:code",  () => {
    test("Update a single company", async() => {
        const res = await request(app).patch(`/companies/${testCompany.code}`).send({code:'google', name:'Google_test', description:'search engine'})
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({company:{code:testCompany.code, name:'Google_test', description:'search engine'}})
        })
    test("Respond with 404 for invalid code", async() => {
    const res = await request(app).patch(`/companies/0`)
    expect(res.statusCode).toBe(404)
    })
})

describe("DELETE /companies/:code", () => {
    test("Delete a new company", async() => {
        const res = await request(app).delete('/companies/${testCompany.code}')
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({status: "deleted"})
    })
})
