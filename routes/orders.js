const express = require('express');
const router = express.Router();
const isEmpty = require('is-empty');
const db = require('../config/db');
const mailService = require('../util/util');

let order, query, id, data, mailDataObject;

// get all fulfilled orders
router.get('/', function (req, res) {
    query = `
    select order_customer.orderID as orderID, users.firstName as user, 
        productName as products, order_product.totalPrice as total, 
        order_product.createdOn as date
        
        from users
          inner join 
            order_customer 
                on userID = users.id
         inner join 
            order_product 
                on order_customer.id = order_product.id
        inner join 
            products p 
                on order_product.productID = p.id`;
    db.query(query, function (err, rows) {
        if (!err) {
            if (isEmpty(rows)) {
                res.status(404);
                res.json({
                    status: 404,
                    message: 'NOT FOUND, No Orders Found'
                });
            } else {
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

// no need for this endpoint ::todo:: remove now
router.get('/fulfilled', function (req, res) {
    query = `Select * from orders where status = 'fulfilled' order by id desc`;
    db.query(query, function (err, rows) {
        if (!err) {
            if (isEmpty(rows)) {
                res.status(404);
                res.json({
                    status: 404,
                    message: 'NOT FOUND, No Fulfilled Orders Found'
                });
            } else {
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

router.get('/:id', function (req, res) {
    // get all user orders
    id = req.params.id;

    query = `
    select order_customer.orderID as orderID, users.firstName as user, 
        productName as products, order_product.totalPrice as total, 
        order_product.createdOn as date
        
        from users
          inner join 
            order_customer 
                on userID = users.id
         inner join 
            order_product 
                on order_customer.id = order_product.id
        inner join 
            products p 
                on order_product.productID = p.id 
      where users.id = ${id}`;

    db.query(query, function (err, rows) {
        console.log(query);
        if (isEmpty(rows)){
            res.status(404);
            res.json({
                status: 404,
                message: 'User ' + id + ' has made no orders'
            })
        } else {
            console.log(rows);
            res.status(200);
            res.json({
                status: 200,
                message: rows
            });
        }
    });
})

// add new order
router.post('/create', async function (req, res, err) {
    if (req) {
        order = {
            userID: req.body.userID,
            productID: req.body.productID,
            quantity: req.body.quantity,
            createdOn: new Date()
        }

        // check for empty values
        if (isEmpty(order.productID) || isEmpty(order.quantity) || isEmpty(order.userID)) {
            console.log('Missing Fields %s', order);
            res.status(400);
            res.json({
                status: 400,
                message: 'Fail, BAD REQUEST, Missing order fields',
                stream: order
            })
        } else {
            // check for product price
            query = `Select productName, productImage, price from products where id = ${order.productID}`;
            db.query(query, function (err, rows) {
                if (!err) {
                    if (isEmpty(rows)) {
                        res.status(404);
                        res.json({
                            status: 404,
                            message: 'No product found'
                        });
                    } else {
                        console.log('Got this:-> %s', rows[0].price);
                        console.log('Got this:-> %s', rows[0].productName);
                        console.log('Got this:-> %s', rows[0].productImage);
                        
                        let totalPrice = rows[0].price * order.quantity;
                        data = saveOrder(order, totalPrice);
                        sendOrderEmail(rows[0].productName, order.userID, totalPrice);
                        console.log(data);
                        
                        res.status(201);
                        res.json({
                            status: 201,
                            message: 'Order Saved Successfully',
                            stream: order.createdOn,
                            orderID: rows.insertId
                        });
                    }
                } else {
                    console.log('An Error Occurred: %s', err.message);
                    res.status(400);
                    res.json({
                        status: 400,
                        message: err.message
                    });
                }
            });
        }
    } else {
        console.log('An Error Occurred: %s', err.message);
        res.status(400);
        res.json({
            status: 400,
            message: err.message
        });
    }
});

router.get('/analytics/orders', function (req, res) {
    query = `select count(*) as Orders from order_customer;`
    db.query(query, function (err, rows) {
        if (!err) {
            if (isEmpty(rows)) {
                console.log('No data');
                res.status(404);
                res.json({
                    status: 404,
                    message: 'Cannot perform analytics on orders'
                })
            } else {
                console.log('Order Analytics returned: %s', rows[0].Orders);
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

router.get('/analytics/sales', function (req, res) {
    query = `select sum(totalPrice) as Sales from order_product;;`
    db.query(query, function (err, rows) {
        if (!err) {
            if (isEmpty(rows)) {
                console.log('No data');
                res.status(404);
                res.json({
                    status: 404,
                    message: 'Cannot perform analytics on Sales'
                })
            } else {
                console.log('Sales Analytics returned: %s', rows[0].Sales);
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

function saveOrder(order, totalPrice) {
    order_product = {
        productID: order.productID,
        quantity: order.quantity,
        totalPrice: totalPrice,
        createdOn: order.createdOn
    }
    query = `Insert into order_product set?`
    console.log(order_product, '\n', query);

    db.query(query, order_product, function (err, rows) {
        if (!err) {
            console.log('Entry Saved');
            console.log(order_product);
            console.log('Calling saveToOrderCustomer with orderID set to: %s', rows.insertId);

            saveToOrderCustomer(order.userID, rows.insertId, order_product.createdOn);
            return order_product;
        } else {
            console.log('An Error Occurred');
            console.log(err.message)
            return err.message
        }
    })
    return order_product.totalPrice;
}

function saveToOrderCustomer(order, orderID, createdOn) {
    orderToCustomer = {
        orderID: orderID,
        userID: order,
        createdOn: createdOn
    }
    query = `Insert into order_customer set?`
    console.log(orderToCustomer, '\n', query);

    db.query(query, orderToCustomer, function (err, rows) {
        if (!err) {
            console.log('Saved to Customer Orders table');
            console.log(orderToCustomer);
            return rows.insertId;
        } else {
            console.log('An error occurred');
            console.log(err.message)
            return err.message
        }
    })
}

// todo:: add function to send confirmation email
function sendOrderEmail(productName, userID, totalPrice) {
    query = `Select email, firstName from users where id = ${userID}`
    db.query(query, function (err, rows) {
        if (!err) {
            // send email
            mailDataObject = {
                to: rows[0].email,
                from: 'jennifer.tagoe@regent.edu.gh',
                subject: 'Order Fulfillment',
                firstName: rows[0].firstName,
                productName: productName,
                totalPrice: totalPrice
            }
            mailService.mailServer('orders', mailDataObject);
        } else {
            console.log('An Error Occurred');
            console.log(err.message);
            return err.message;
        }
    });
}

module.exports = router;


/**
 *
 * user have one order
 * or multiple orders
 *
 * order can have one product
 * or mulptiple products
 */
