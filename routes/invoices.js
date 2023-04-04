const express = require("express")
const ExpressError = require("../expressError")
const router = express.Router()
const db = require("../db")

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(`SELECT * FROM invoices`)
    return res.json({ invoices: result.rows })
  } catch (err) {
    next(err)
  }

})

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const invoiceRes = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id])
    const invoiceSelected = invoiceRes.rows[0]
    const companyRes = await db.query(`SELECT * FROM companies WHERE code = '${invoiceSelected.comp_code}'`)
    const { comp_code, ...invoiceRest } = invoiceSelected
    return res.json({ invoice: invoiceRest, company: companyRes.rows[0] })
  } catch (err) {
    next(err)
  }

})

router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body
    const result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt])
    return res.status(201).json({ invoice: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { amt } = req.body
    const result = await db.query(`UPDATE invoices SET amt=$1 where id = $2 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, id])
    return res.json({ invoice: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    await db.query(`DELETE FROM invoices WHERE id=$1`, [id])
    return res.json({ status: "deleted" })
  } catch (err) {
    next(err)
  }
})

module.exports = router
