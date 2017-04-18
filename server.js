'use strict'

var http = require('http') 
var fs   = require('fs')
var path = require('path')
var mime = require('mime')
var ejs  = require('ejs')
var bodyParser = require('body-parser')
var jwt    = require('jsonwebtoken') 

var api = require('./api/api.js')
var mongo = require('mongodb'),dbc 
var express = require('express')
var config   = require('./config/config.js')
var app = express() 


// token based authentication 

app.set('jwtTokenSecret', 'satyamsinghtoken') 



app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'))
})


mongo.connect('mongodb://localhost/ptest', function(err, db) {
  if (err) {
    console.log('Could not connect to mongo')
  } else {
    console.log('Connected to mongo db:' )
    dbc = db 
    var apiObj = new api(app, dbc) 

    //console.log('dbc', dbc)
    apiObj.signup(dbc)  
 // {'userName': req.body.UserName , 'password' : req.body.password }
    app.post('/Login', function(req, res) {  
      let user = require('./Model/user.js') 
      let suser = new user(dbc)   
      console.log('up to here')
      let query = { userName : 'satyam' }  
      query =  JSON.stringify(query) 
      let sel = JSON.parse(query) 

      return suser.list(sel).then(function(data) { 
        if( data.length ) console.log ('congrats succesfull login' +  data[0]) 
        console.log('data', data) 
        let token = jwt.sign(data[0], config.jwt_secret, {
          expiresIn: 1440  // expires in 1 hour
        })  
       /// console.log('token is', token) 
       // res.json({error:false, token: token}) 
        return res.sendFile( __dirname + '/views/welcome.html')
       // return Promise.resolve(res.send(data[0])) 
      }).catch(function(err) {
        console.log('error is ', err)
      }) 

    }) 

    // location store api 

    app.post('/LOC_DB', function(req, res) {  
      let location = require('./Model/location.js') 
      let loc = new location(dbc)   
      let obj = {
        address_components  : req.body.address_components,
        formatted_address   : req.body.formatted_address,
        lat                 : req.body.lat,
        lng                 : req.body.lng
      }   
      loc.upsert(obj)  
      return res 

    })

    app.get('/get_loc', function(req, res) {   
      console.log('coming here') 
      let location = require('./Model/location.js') 
      let loc = new location(dbc)   
      return loc.list().then(function(data) { 
        console.log(data)
        return res.send(data)
      })
    }) 
  }
})   

app.use(express.static('public'))
app.listen(4000)
console.log('Listening on port 4000...')  
