var express = require('express');
var router = express.Router();
const isEmpty = require('is-empty');
const passwordHash = require('../config/password');
let db = require('../config/db');
const mailService = require('../util/util');

let user, query, mailDataObject;

// create new user
router.post('/create', function (req, res, err) {
  if (req) {
      user = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      otherNames: req.body.otherNames,
      email: req.body.email,
      password: passwordHash.passwordHash(req.body.password),
      contactNo: req.body.contactNo,
      userType: req.body.userType
      };

    // check for empty values
    if (isEmpty(user.firstName) || isEmpty(user.lastName) || isEmpty(user.email)
      || isEmpty(user.password) || isEmpty(user.contactNo)) {
      // console.log(`Missing Fields: ${user}`);
      console.log('Missing Fields %s', user)
      res.status(400);
      res.json({
        status: 400,
        message: 'FAIL, BAD REQUEST, Missing user fields',
        stream: user
      });
    } else {
      // insert data into database
      query = `Insert into users set?`;
      db.query(query, user, function (err, rows) {
        if (!err) {
          res.status(201);
          res.json({
            status: 201,
            message: `User Created`,
            stream: user
          });
          // send welcome email here
          mailDataObject = {
            to: user.email,
            firstName: user.firstName,
            from: 'jennifer.tagoe@regent.edu.gh',
            subject: 'Welcome to EOS Enterprise'
          };

          mailService.mailServer('register', mailDataObject);
        } else {
          console.log(`An Error Occurred: ${err.message}`);
          res.status(400);
          res.json({
            status: 400,
            message: `An Error Occurred: ${err}`
          })
        }
      })
    }
  } else {
    console.log(`INTERNAL SERVER ERROR: ${err}`);
    res.status(500);
    res.json({
      status: 500,
      message: `INTERNAL SERVER ERROR: ${err}`
    });
  }
})


// get all users
router.get('/', function (req, res, next) {
  query = `Select * from users`;
  db.query(query, function (err, rows) {
    if (!err) {
      if (isEmpty(rows)) {
        console.log(`No Users on the System`);
        res.status(404);
        res.json({
          status: 404,
          message: 'No Users on the System'
        });
      } else {
        console.log(rows);
        res.status(200);
        res.json({
          status: 200,
          message: rows
        });
      }
    } else {
      console.log(`An Error occurred: -> ${err.message}`);
      res.status(400);
      res.json({
        status: 400,
        message: `${err.message}`
      });
    }
  });
});


// get one user
router.get('/:id', function (req, res) {
  res.status(200);
  res.json({
    status: 200,
    id: req.params.id
  });
});

// update one user
router.put('/user/:id', function (req, res) {
  res.status(200);
  res.json({
    status: 200,
    id: req.params.id
  });
});

// delete user
router.delete('/user/delete', function (req, res) {
  res.status(200);
  res.json({
    status: 200,
  });
});

router.get('/analytics/users', function (req, res) {
  query = `Select count(*) as Users from users;`
  db.query(query, function (err, rows) {
    if (!err) {
        if (isEmpty(rows)) {
            console.log('No data');
            res.status(404);
            res.json({
                status: 404,
                message: 'Cannot perform analytics on users'
            })
        } else {
            console.log('Users Analytics returned: %s', rows[0].Users);
            res.status(200);
            res.json({
                status: 200,
                message: rows
            });
        }
    } else {
        console.log(`Got an error: ${err.message}`);
        res.status(400);
        res.json({
            status: 400,
            message: `FAIL, BAD REQUEST, ${err.message}`
        });
    }
})
});
module.exports = router;
