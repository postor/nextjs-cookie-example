const express = require('express')
const router = express.Router()

//csrf
const csurf = require('csurf')
const csrfProtection = csurf({ cookie: true })
const csrfSetHeader = (req, res, next) => {
  res.header('csrf-token', req.csrfToken())
  res.header('Access-Control-Allow-Origin', '*')
  next()
}

//example user
const user = {
  username: 'test',
  passwd: '123456',
  tempkey: 'tempkey',
}

//login
router.post('/auth', csrfProtection, csrfSetHeader, (req, res) => {
  if (req.body && req.body.username === user.username && req.body.passwd === user.passwd) {
    res.cookie('user', JSON.stringify(user))
    res.header('custom-set-cookie', res.getHeader('set-cookie'))
    res.json(user)
  } else {
    res.json({ error: 'wrong pass or no such account', body: req.body })
  }
})


router.get('/logout', csrfSetHeader, (req, res) => {
  res.clearCookie('user')
  res.header('custom-set-cookie', res.getHeader('set-cookie'))
  res.json({ error: 0 })
})

//this api acts different after login
router.get('/auth', csrfProtection, csrfSetHeader, (req, res) => {
  res.cookie('date', new Date())
  res.header('custom-set-cookie', res.getHeader('set-cookie'))
  var tuser = req.cookies.user
  if (tuser && typeof tuser === 'string') {
    try {
      tuser = JSON.parse(tuser)
    } catch (e) {
      tuser = {}
    }
  }
  if (tuser && tuser.tempkey === user.tempkey && tuser.username === user.username) {
    res.json(user)
  } else {
    res.json({ error: 'not loged in', tuser })
  }
})

module.exports = router