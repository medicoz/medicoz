'use strict';

/* --------------------------------------------------------------------

   created by satyam singh on 15/04/2017 

------------------------------------------------------------------------ 
*/ 

class Api {
  constructor(app, db) {
    const _    =  this

    _.app      =  app
    _.db       = db 

  } 

  signup (db, param) { 
    const _   =  this 

    return new Promise(function(res, reject) {
      _.app.post('/signup', function(req, res) { 
        let user = require('../Model/user.js') 
        let suser = new user(_.db) 

        let obj = {
          userName            : req.body.user,
          password            : req.body.password[0],
          mobileNo            : '9964102245',  
          firstName           : req.body.user,
          lastName            : 'singh',
          dob                 : 0,
          gender              : '',
          emailId             : req.body.email
        }   
        suser.upsert(obj)
        console.log('signup api is called', req.body) 
        _.app.engine('html', require('ejs').renderFile);
        _.app.set('view engine', 'html');
        
        res.render('./welcome.html')  

        return    
      })
    }) 
  }     
  getData () {
    const _   =   this 
    _.app.post('/get', function(req, res) { 
      let user = require('../Model/user.js') 
      let suser = new user(_.db)  
      return suser.findOne() 
    })
  }

  getWines(param) {
    const _   = this 
    let obj  

    _.app.get('/wines', function(req, res) {    
      var collection = db.collection('satyam')            
      res.send([{name:'wine1'}, {name:'wine2'}])
    })

  }  

}

module.exports = Api