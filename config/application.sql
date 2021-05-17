create database if not exists jen_commerce;

use jen_commerce;

# Create Users SQL
create table if not exists users
(
	id int auto_increment
		primary key,
	firstName varchar(100) default '' not null,
	lastName varchar(100) default '' not null,
	otherNames varchar(100) default '' null,
	email varchar(250) default '' not null,
	password varchar(250) default '' not null,
	contactNo varchar(20) default '' not null,
	userType int default 1 null
);

# Create Categories SQL
create table if not exists categories
(
    id           int auto_increment
        primary key,
    categoryName varchar(100) not null,
    description  varchar(300) null
);

# Create Products SQL
create table if not exists products
(
    id           int auto_increment
        primary key,
    productName  varchar(100) not null,
    categoryID   int          not null,
    price        double       not null,
    productImage varchar(300) null,
    description  varchar(300) null,
    stock        int          not null,
    createdOn    varchar(300) not null
);

# Create Order_Product
create table if not exists order_product
(
    id         int auto_increment
        primary key,
    productID  int          not null,
    quantity   int          not null,
    totalPrice double       not null,
    createdOn  varchar(250) not null
);


# Create Order_Customer
create table if not exists order_customer
(
    id        int auto_increment
        primary key,
    orderID   int          not null,
    userID    int          not null,
    createdOn varchar(250) not null
);

# Create Promotions table
create table if not exists promotions
(
    id            int auto_increment
        primary key,
    promotionName varchar(250)                  not null,
    categoryID    int                           not null,
    discount      int                           not null,
    startDate     varchar(250)                  not null,
    endDate       varchar(250)                  not null,
    status        varchar(100) default 'active' null,
    createdOn     varchar(250)                  not null
);
