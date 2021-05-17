const express = require('express');
const router = express.Router();
const isEmpty = require('is-empty');
let db = require('../config/db');

let product, query, id;

// create new product
router.post('/create', function (req, res, err) {
    if (req) {
        product = {
            productName: req.body.productName,
            categoryID: req.body.categoryID,
            price: req.body.price,
            productImage: req.body.productImage,
            description: req.body.description,
            stock: req.body.stock,
            createdOn: new Date()
        };

        // check for empty values
        if (isEmpty(product.productName) || isEmpty(product.categoryID)) {
            console.log('Missing Fields %s', product);
            res.status(400);
            res.json({
                status: 400,
                message: 'FAIL, BAD REQUEST, Missing product fields',
                stream: product
            });
        } else {
            // insert data into database
            query = `Insert into products set?`;
            console.log('Inserting %s', product, ' to the db');
            db.query(query, product, function (err, rows) {
                if (!err) {
                    // todo :: perform check for already exisitng product
                    res.status(201);
                    res.json({
                        status: 201,
                        message: 'Product Created',
                        stream: product
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
});

// get all products
router.get('/', function (req, res) {
    query = `select products.id, products.productName, products.price, products.productImage, categories.categoryName as category, products.description, products.stock, products.createdOn
    from products
    join categories  on products.categoryID = categories.id
     order by id desc`;
    db.query(query, function (err, rows) {
        if (!err) {
            if (isEmpty(rows)) {
                res.status(404);
                res.json({
                    status: 404,
                    message: 'NOT FOUND, No Products Found'
                });
            } else {
                res.status(200);
                res.json({
                    status: 200,
                    message: rows
                });
            }
        } else {
            console.log('An Error Occurred %s', err.message);
            res.status(400);
            res.json({
                status: 400,
                message: `FAIL, BAD REQUEST, ${err.message}`
            });
        }
    });
});

// get one product
router.get('/:id', function (req, res) {
    id = req.params.id;
    query = `select products.id, products.productName, products.price, products.productImage, categories.categoryName as category, products.description, products.stock, products.createdOn
    from products
    join categories  on products.categoryID = categories.id
    where products.id = ${id}`;
    db.query(query, function (err, rows) {
        if (!err) {
            if (isEmpty(rows)) {
                res.status(404);
                res.json({
                    status: 404,
                    message: `NOT FOUND, No Product with ID ${id} found`
                });
            } else {
                console.log('Found product with id %s', id);
                console.log(rows[0]);
                res.status(200);
                res.json({
                    status: 200,
                    message: rows[0]
                });
            }
        } else {
            console.log(`An Error Occurred ${err.message}`);
            res.status(400);
            res.json({
                status: 400,
                message: `FAIL, BAD REQUEST, An Error Occurred: ${err.message}`
            });
        }
    });
});

// update one product
router.put('/update/:id', function (req, res) {
    id = req.params.id
    query = `Update products set? where id = ${id}`;
    if (req) {
        product = {
            productName: req.body.productName,
            categoryID: req.body.categoryID,
            price: req.body.price,
            productImage: req.body.productImage,
            description: req.body.description,
            stock: req.body.stock
        };

        if (isEmpty(product.productName) || isEmpty(product.categoryID)) {
            console.log('Missing Fields %s', product);
            res.status(400);
            res.json({
                status: 400,
                message: 'FAIL, BAD REQUEST, Missing product fields',
                stream: product
            });
        } else {
            console.log('Updating %s', product, ' in the db');
            db.query(query, product, function (err, rows) {
                if (!err) {
                    // todo :: perform check for already exisitng product
                    res.status(200);
                    res.json({
                        status: 200,
                        message: 'Product Updated',
                        stream: product
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
});

router.delete('/delete/:id', function (req, res) {
    id = req.params.id;

    query = `Delete from products where id =${id}`;
    db.query(query, function (err, rows) {
        if (!err) {
            console.log(query);
            res.status(200);
            res.json({
                status: 200,
                message: 'Product Deleted',
            });
            console.log('Query Finished, returned: %s', rows.affectedRows)
        } else {
            console.log(`An Error Occurred: ${err.message}`);
            res.status(400);
            res.json({
                status: 400,
                message: `An Error Occurred: ${err}`
            });
        }
    })
});

// product analytics route
router.get('/analytics/products', function (req, res) {
    query = `select count(*) as Products from products;`
    db.query(query, function (err, rows) {
        if (!err) {
            if (isEmpty(rows)) {
                console.log('No data');
                res.status(404);
                res.json({
                    status: 404,
                    message: 'Cannot perform analytics on products'
                })
            } else {
                console.log('Product Analytics returned: %s', rows[0].Products);
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
})

module.exports = router;