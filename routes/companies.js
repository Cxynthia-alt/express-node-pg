const express = require("express")
const ExpressError = require("../expressError")
const router = express.Router()
const db = require("../db")

router.get('/', async (req, res, next) => {
    try {
        const result = await db.query(`SELECT * FROM companies`)
        return res.json({ companies: result.rows })
    } catch (err) {
        return next(err)
    }

})

router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params
        const result = await db.query(`SELECT * FROM companies WHERE code=$1`, [code])
        const invoiceRes = await db.query(`SELECT * FROM invoices WHERE comp_code=$1`, [code])
        if (result.rows.length === 0) {
            throw new ExpressError(`Can't find the company with code of ${code}`, 404)
        }
        return res.json({ company: result.rows[0], invoices: invoiceRes.rows[0] })
    } catch (err) {
        return next(err)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body
        const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code,name, description`, [code, name, description])
        return res.status(201).json({ company: result.rows[0] })
    } catch (err) {
        return next(err)
    }
})

router.patch('/:code', async (req, res, next) => {
    try {
        const { code } = req.params
        const { name, description } = req.body
        const result = await db.query(`UPDATE companies SET name=$2,description=$3 WHERE code=$1 RETURNING code,name, description`, [code, name, description])
        if (result.rows.length === 0) {
            throw new ExpressError(`Can't find the company with code of ${code}`, 404)
        }
        return res.json({ company: result.rows[0] })
    } catch (err) {
        return next(err)
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
        const { code } = req.params
        const result = await db.query(`DELETE FROM companies WHERE code = $1`, [code])
        return res.json({ status: "deleted" })
    } catch (err) {
        return next(err)
    }
})
module.exports = router
