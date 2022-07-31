# rentalpoint
RentalPoint is the culmination of phase 1, phase 2 and the final implementation of the car reservation system through development. The car registration application was chosen, due to it's more compelling use cases and to utimately demonstrate our knowlege of databases. RentalPoint was built on Node.js as the backend of this project, with Express.js to handle middleware and endpoints, along with Handlebars which was the templating engine used to display content. Finally, MySql is the RDMS used for the project. 

## Table of Contents
- [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Setting up Dev Enviornment](#setting-up-dev-environment)  
- [Application Usage](#application-usage)
- [Frameworks Used](#frameworks-used)
  - [Dependencies](#dependencies)
  - [Development Dependencies](#development-dependencies) 
- [Screenshots](#screenshots)
- [Features](#features)
- [Links](#links)

## Installation
If you want to test out the project in a timely and efficient manner, the link for the deployed website can be found below. The installation process has 2 steps, the first step focuses on the creation of the schema and the appropriate tables. The second step focuses on recreating the development environment, and the setup of the connection to your new tables.
### Database Setup
Assuming a localhost setup, for the ease of creating the tables we will be running SQL scripts to build the schema and table.
#### Schema: Car Reservation System:
>CREATE SCHEMA `reservation-system`
#### Table 1: Accounts
>CREATE TABLE `accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fname` varchar(255) NOT NULL,
  `lname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `country` varchar(45) NOT NULL,
  `birthdate` datetime NOT NULL,
  `password` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2205 DEFAULT CHARSET=utf8
#### Table 2: Verified Accounts
>CREATE TABLE `verified_accounts` (
  `user_id` int(11) NOT NULL,
  `license` int(11) DEFAULT NULL,
  `isSeller` int(11) DEFAULT '0',
  `phone` char(10) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `verified_accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8
#### Table 3: Listings
>CREATE TABLE `listings` (
  `listing_id` int(11) NOT NULL AUTO_INCREMENT,
  `host_id` int(11) NOT NULL,
  `datecreated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `price` decimal(7,2) NOT NULL,
  `picture` varchar(255) DEFAULT NULL,
  `avaliable_start` datetime NOT NULL,
  `avaliable_end` datetime NOT NULL,
  `location` varchar(255) NOT NULL,
  PRIMARY KEY (`listing_id`),
  KEY `listings_ibfk_1` (`host_id`),
  CONSTRAINT `listings_ibfk_1` FOREIGN KEY (`host_id`) REFERENCES `accounts` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=605 DEFAULT CHARSET=utf8
#### Table 4: Vehicles
>CREATE TABLE `listing_car` (
  `car_id` int(11) NOT NULL AUTO_INCREMENT,
  `listing_id` int(11) NOT NULL,
  `manufacturer` varchar(255) NOT NULL,
  `model` varchar(255) NOT NULL,
  `car_year` int(11) NOT NULL,
  `seats` int(11) NOT NULL,
  `state` int(11) NOT NULL,
  PRIMARY KEY (`car_id`,`listing_id`),
  KEY `listing_id` (`listing_id`),
  CONSTRAINT `listing_car_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`listing_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=745 DEFAULT CHARSET=utf8
#### Table 5: Rented Vehicles
>CREATE TABLE `rented_cars` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `listing_id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `pickup` datetime NOT NULL,
  `dropoff` datetime NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `price` decimal(12,2) DEFAULT NULL,
  `datecreated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `listing_id` (`listing_id`),
  KEY `car_id` (`car_id`),
  KEY `buyer_id` (`buyer_id`),
  CONSTRAINT `rented_cars_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`listing_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `rented_cars_ibfk_2` FOREIGN KEY (`car_id`) REFERENCES `listing_car` (`car_id`),
  CONSTRAINT `rented_cars_ibfk_3` FOREIGN KEY (`buyer_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=215 DEFAULT CHARSET=utf8
### Setting up Dev Environment
**Note:** Node version 14.0.0 or higher is required!
This portion of the setup we will be recreating the development environment, and establishing the connection between the schema and our project.
#### Clone the repository, recreating the files on your own system
>git clone https://github.com/Sujeev-Uthayakumar/rentalpoint.git
#### Install the dependencies needed, that is already predefined
>npm install
#### Ensure the installation of nodemon, this will run our localhost server
>npm install nodemon --save-dev
#### Establish the connection within the database.js file, entering in the details of your database
>const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'reservation-system',
  multipleStatements: true,
});
#### Running the server script, allows the user to launch the application on localhost:3000
>npm run devStart
>
>Finally, in your browser open "localhost:3000"

#### After this final step, the project will be fully functioning allowing you to make accounts, reserve vehicles and make listings. When establishing a connection, it can also be useful to make changes within the .env file but due to this being a localhost project it will be of no use.

## Application Usage
RentalPoint has 2 points of usage, one of being a user and another being a seller, where the user is only able to use the website to make reservations. While the seller on the other hand is able to make listings, and allow other users to reserve them.
### Seller Account
To become a seller, you must register through the seller portal which can be found in the navbar known as "For Sellers". This process will ask for more information then user account registration, but will allow for more functionality. Within the "My Account" tab, you will see a total of 5 tabs compared to the 3 tabs that the regular user account has. These 2 new tabs are specific to managing listings, where you have the ability to delete listings and to view the orders on your specific listings. 

Another aspect of a seller account, is the "Listings" tab which has a special button to allow sellers to add listings. Where a seller can give information describing the vehicle, and the date range of the listing. After this listing is posted, users can view these listings and reserve based on this information.
### User Account
A user account is made when you register through the regular portal, you can click "Join Now" on the home page. When a user account is made, they can view the listings in the "Listings" tab which provides listings based on the account country (which can be changed in the "My Account" tab). Based on the listing that the user favours, they can select the date range they wish to reserve the vehicle from. With this information sent to the Seller account associated with that specific listing. You can view the order within the "My Account" tab for future reference if needed.

## Frameworks Used
### Dependencies:
- [Body-Parser: 1.19.0](https://www.npmjs.com/package/body-parser)
- [Connect-Busboy: 0.0.2](https://www.npmjs.com/package/connect-busboy)
- [Dayjs: 1.10.7](https://www.npmjs.com/package/dayjs)
- [Express: 4.17.1](https://www.npmjs.com/package/express)
- [Express-Fileupload: 1.2.1](https://www.npmjs.com/package/express-fileupload)
- [Express-Handlebars: 5.3.4](https://www.npmjs.com/package/express-handlebars)
- [Express-Session: 1.17.2](https://www.npmjs.com/package/express-session)
- [Flatpickr: 4.6.9](https://www.npmjs.com/package/flatpickr)
- [Foundation-Sites: 6.7.4](https://www.npmjs.com/package/foundation-sites)
- [MySql2: 2.2.3](https://www.npmjs.com/package/mysql2)
### Development Dependencies
- [Dotenv: 10.0.0](https://www.npmjs.com/package/dotenv)
- [Nodemon: 2.0.15](https://www.npmjs.com/package/nodemon)

## Screenshots
### Home Page
![HomePage](https://i.ibb.co/h9SgpdJ/Screen-Shot-2021-11-25-at-6-36-23-AM.png "Home Page")
### Listings Page
![ListingsPage](https://i.ibb.co/FbDyYKf/Screen-Shot-2021-11-25-at-6-36-57-AM.png "Listings Page")
### My Accounts Page
![AccountPage](https://i.ibb.co/ZhbH03F/Screen-Shot-2021-11-25-at-6-37-09-AM.png "Accounts Page")
### Registration Page
![RegistrationPage](https://i.ibb.co/PYMNwjZ/Screen-Shot-2021-11-26-at-8-03-35-AM.png "Registration Page")


## Features
- Ability to create accounts, seller or user accounts
- Create listings for sellers
- Ability to reserver listings for dates
- My Account tab which allows users to view important details regarding their orders
- Change location of account to view more listings
- A live tally of accounts and listings within the database
- Checkout page, that relays order totals
- Home page that outputs the recently added listings
- Attach images to listings (for localhost projects)

## Links
- [RentalPoint Production Website](https://rental-point.herokuapp.com/)

