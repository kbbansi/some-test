const express = require('express');
const router = express.Router();
const isEmpty = require('is-empty');
const db = require('../config/db');

let promotion, query, id;

// get all created promotions
router.get('/', function (req, res) {
    query = `select promotions.promotionName as promotion, 
            categories.categoryName as category, 
            discount, startDate, endDate, createdOn, status
        from promotions
            inner join categories
         on promotions.categoryID = categories.id;`;

    db.query(query, function (err, rows) {
        if (!err){
            if (isEmpty(rows)){
                console.log('No Promotions created');
                res.status(404);
                res.json({
                    status: 404,
                    message: 'No Promotions Created'
                });
            } else {
                console.log(rows)
                res.status(200);
                res.json({
                    status: 200,
                    message: rows
                })
            }
        } else {
            console.log('An Error Occurred: %s', err.message);
            res.status(400);
            res.json({
                status: 400,
                message: `FAIL, BAD REQUEST, ${err.message}`
            });
        }
    })
})

// get all active promotions
router.get('/active', function (req, res) {
    query = `select promotions.promotionName as promotion, 
            categories.categoryName as category, 
            discount, startDate, endDate, createdOn, status
        from promotions
            inner join categories
         on promotions.categoryID = categories.id 
         where status = 'active'`;
    db.query(query, function (err, rows) {
        if (!err) {
            if (isEmpty(rows)) {
                console.log('No Active Promotions Found');
                res.status(200);
                res.json({
                    status: 404,
                    message: 'No Active Promotions found'
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
            console.log('An Error Occurred: %s', err.message);
            res.status(400);
            res.json({
                status: 400,
                message: `FAIL, BAD REQUEST, ${err.message}`
            });
        }
    });
});

router.get('/ended', function(req, res) {
    query = `select promotions.promotionName as promotion, 
            categories.categoryName as category, 
            discount, startDate, endDate, createdOn, status
        from promotions
            inner join categories
         on promotions.categoryID = categories.id
          where status = 'ended'`;
    db.query(query, function (err, rows) {
        if (!err) {
            if (isEmpty(rows)) {
                console.log('No Ended Promotions Found');
                res.status(200);
                res.json({
                    status: 404,
                    message: 'No Ended Promotions found'
                })
            } else {
                console.log(rows);
                res.status(200);
                res.json({
                    status: 200,
                    message: rows
                })
            }
        } else {
            console.log('An Error Occurred: %s', err.message);
            res.status(400);
            res.json({
                status: 400,
                message: `FAIL, BAD REQUEST, ${err.message}`
            });
        }
    })
})

// create new promotion
router.post('/create', function (req, res, err) {
    if (req) {
        promotion = {
            promotionName: req.body.promotionName,
            categoryID: req.body.categoryID,
            discount: req.body.discount,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            createdOn: new Date()
        }

        // check for empty values
        if (isEmpty(promotion.promotionName) || isEmpty(promotion.startDate) || isEmpty(promotion.discount)
        || isEmpty(promotion.categoryID)) {
            console.log('Missing fields: %s', promotion);
            res.status(400);
            res.json({
                status: 400,
                message:'Fail, BAD REQUEST, Missing Promo fields',
                stream: promotion
            });
        } else {
            // save promotion to database
            query = `Insert into promotions set?`;
            db.query(query, promotion, function (err, rows) {
                if (!err){
                    console.log(`Creating promotion: ${promotion.promotionName}`)
                    res.status(201);
                    res.json({
                        status: 201,
                        message: 'Promotion Created',
                        stream: promotion
                    });
                } else {
                    console.log(`An Error Occurred: ${err.message}`);
                    res.status(400);
                    res.json({
                        status: 400,
                        message: `An Error Occurred: ${err}`
                    });
                }
            });
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

// update a promotion
router.put('/update/:id', function (req, res, err) {
    if (req) {
        id = req.params.id;
        promotion = {
            promotionName: req.body.promotionName,
            discount: req.body.discount,
            endDate: req.body.endDate,
        }

        // check for empty values
        if (isEmpty(promotion.promotionName) || isEmpty(promotion.discount) || isEmpty(promotion.endDate)){
            console.log('Update failed, Missing fields: %s', promotion);
            res.status(400);
            res.json({
                status: 400,
                message:'Fail, BAD REQUEST, Missing Promo fields',
                stream: promotion
            });
        } else {
            query = `Update promotions set? where id = ${id}`;
            db.query(query, promotion, function (err, rows) {
                if (!err) {
                    console.log('Updating Promotion: %s', promotion.promotionName);
                    res.status(200);
                    res.json({
                        status: 200,
                        message: 'Promotion Updated',
                        stream: promotion
                    });
                } else {
                    console.log(`An Error Occurred: ${err.message}`);
                    res.status(400);
                    res.json({
                        status: 400,
                        message: `An Error Occurred: ${err}`
                    });
                }
            });
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

// // update a promotion :: manually end promotion
router.put('/update/end/:id', function (req, res) {
    id = req.params.id;
    query = `Update promotions set status = 'ended' where id = ${id}`;
    db.query(query, function (err, rows) {
        if (!err) {
            console.log(query);
            console.log('Updating promotion..... %s', id);
            res.status(200);
            res.json({
                status: 200,
                message: 'Promotion Ended'
            });
        } else {
            console.log(`An Error Occurred: ${err.message}`);
            res.status(400);
            res.json({
                status: 400,
                message: `An Error Occurred: ${err}`
            });
        }
    });
})


// get one promotion
router.get('/:id', function (req, res) {
    id = req.params.id;
    query = `select promotions.promotionName as promotion, 
            categories.categoryName as category, 
            discount, startDate, endDate, createdOn, status
        from promotions
            inner join categories
         on promotions.categoryID = categories.id where promotions.id = ${id}`
    db.query(query, function (err, rows) {
        console.log(query);
        if (isEmpty(rows)) {
            console.log('No Promotions found');
            res.status(404);
            res.json({
                status: 404,
                message: 'No Promotions found'
            })
        } else {
            console.log(rows);
            res.status(200);
            res.json({
                status: 200,
                message: rows
            });
        }
    })
})


module.exports = router;
