const express = require('express');
const router = express.Router();
const isEmpty = require('is-empty');

const passHash = require('../config/password');
let db = require('../config/db');

let login, passwordCheckQuery, query, encryptedPassword;

// login route
router.post('/login', function (req, res, err) {
    login = {
        email: req.body.email,
        password: req.body.password
    };

    passwordCheckQuery = `Select password from users where email = '${login.email}'`;
    
    // find a way to async i/o operations
    db.query(passwordCheckQuery, function (err, rows) {
        if (!err) {
            
            // on empty sql row set
            if(isEmpty(rows)) {
                console.log(`No such user with email ${login.email} found`);
                res.status(404);
                res.json({
                    status: 404,
                    message: `No such user with email ${login.email} found`
                })
            } else {
                // set status to ok to prevent system crash
                res.status(200);

                // store sql result into variable
                encryptedPassword = rows[0];

                // hashMatch will return true or false for password
                let hashMatch = passHash.hashCompare(login.password, encryptedPassword.password);
                console.log(hashMatch);

                // if hashMatch === true
                if (hashMatch) {
                    query = `Select * from users where email = '${login.email}'`;
                    console.log(query);
                    db.query(query, function (err, rows) {
                        if (!err) {
                            console.log(rows[0]);
                            res.status(200);
                            res.json({
                                status: 200,
                                message: rows[0]
                            });
                        } else {
                            console.log(err);
                            res.status(400);
                            res.json({
                                status: 400,
                                message: 'Failed, BAD REQUEST: ' + err
                            });
                        }
                    });
                } else {
                    console.log('Supplied Password and Hash do not match');
                    res.status(400);
                    res.json({
                        status: 400,
                        message: 'Supplied Password and Hash do not match'
                    });
                }
            }
        } else {
            res.status(500);
            res.json({
                status: 500,
                message: 'Internal Server Error: ' + err
            });
        }
    });
});


module.exports = router;