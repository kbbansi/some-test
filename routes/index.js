const express = require('express');
const router = express.Router();
const mailServer = require('../util/util');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200);
  res.json({
    serviceName: 'E.O.S_ADINKRAH_ENTERPRISE_API',
    version: '1.0.0',
    author: {
      name: 'Tagoe Jennifer',
      email: 'jennifer.tagoe@regent.edu.gh'
    },
    status: {
      Alive: true,
      date: new Date()
    }
  });
});

module.exports = router;
