const express = require("express")
const ExpressError = require("../expressError")
const router = express.Router()
const db = require("../db")


router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(`SELECT i.code, i.name, array_agg(ci.comp_code) AS comp_codes
    FROM industries AS i
    LEFT JOIN company_industry AS ci
    ON i.code = ci.ind_code
    Group BY i.code, i.name;
    `)
    return res.json({ industries: result.rows })
  } catch (err) {
    return next(err)
  }

})

router.post('/', async (req, res, next) => {
  try {
    const { code, name } = req.body
    const result = await db.query(`INSERT INTO industries (code, name) VALUES ($1, $2) RETURNING code,name`, [code, name])
    return res.status(201).json({ industry: result.rows[0] })
  } catch (err) {
    return next(err)
  }
})

router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params
    const result = await db.query(`SELECT * FROM industries WHERE code=$1`, [code])
    if (result.rows.length === 0) {
      throw new ExpressError(`Can't find the industry with code of ${code}`, 404)
    }

    const ind_comp = await db.query(`SELECT i.code, i.name, array_agg(c.name) FROM industries AS i
    LEFT JOIN company_industry AS ci
    ON i.code = ci.ind_code
    LEFT JOIN companies AS c
    ON c.code =ci.comp_code
    WHERE i.code = $1
    GROUP BY i.code, i.name`, [code])
    return res.json({ industry: ind_comp.rows })

  } catch (err) {
    return next(err)
  }
})

module.exports = router
