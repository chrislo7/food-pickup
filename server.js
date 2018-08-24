"use strict";

require('dotenv').config();

const PORT          = process.env.PORT || 8080;
const ENV           = process.env.ENV || "development";
const express       = require("express");
const bodyParser    = require("body-parser");
const sass          = require("node-sass-middleware");
const app           = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));


// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

app.use(express.static("public"));

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));
/*----------------------My Routes--------------------*/

//Menu page
app.get("/menu", (req, res) => {
  knex('products')
    .select('*')
    .asCallback(function(err,products){
      if (err) return console.error(err);
      knex.destroy();

      knex('order_list')
        .select("*")
        .where({client_id: 1})
        .asCallback(function(err, order_list) {
          let templateVars = {
            products: products,
            order_list:order_list
          }
          console.log("menu product & orderlist", templateVars);
          res.render("menu", templateVars);
        })
    })
});

/*
knex('products')
  .select('*')
  .then(products =>{
    knex.select('*').from('order_list')
    .where({users_id: 1})
    .then(orderList => {
      let templateVars = {
        products,
        orderList
      }
      console.log()
      res.render()
    })
    .catch(console.error("Error after selecting from order_list", err))
  })
  .catch(console.error(err))

*/

app.post("/menu", (req, res) => {

});

//Login page
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const {user_name, password} = req.body;
  if (user_name  && password) {
      res.redirect("/");
  } else {
    res.send("sorry, please provide all the infor.");
  }
});


//Register page
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const {user_name, password, phone} = req.body;
  console.log("body: ", req.body)
  if (user_name && password && phone) {
    knex('client')
      .insert(
        {name: user_name, phone: phone}
      )
      .asCallback(function(err,client) {

        if (err) {
           return console.error('ERROR', err);
        }

        // console.log("client: ", client);
        knex.destroy();
        res.redirect("/");
      })
  } else {
    res.send("sorry, please provide all the infor.");
  }
});

app.post("/add/:productsID", (req, res) => {
  //add item into order db;
  console.log("come to insert order");
  console.log(">>>>>>> ", req.params)
  knex('order_list')
      .insert(
        {products_id: Number(req.params.productsID), client_id: 3}
      )
      .asCallback(function(err,client) {

        if (err) {
           return console.error('ERROR', err);
        }

        // knex.destroy();
        console.log("inserted orderlist");
        //redirect to "/menu"
        res.redirect("/menu");
      })
});

//Order page - client view
app.get("/myorder", (req, res) => {
/*  knex('order_list')
    .select('*')
    .where({users_id: 1})
    .asCallback(function(err,order_list){
      if (err) return console.error(err);
      knex.destroy();
      let templateVars = {
        order_list:order_list,
      }
      console.log("orderlist", templateVars);
      res.render("myorder", templateVars);
    })*/
});

//Order page - restaurant view
app.get("/clientorder", (req, res) => {
  res.render("clientorder");
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
