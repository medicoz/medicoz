/*------------------------------------------------------------------------------
     USER
------------------------------------------------------------------------------*/ 
'use strict'

const BaseColl        = require('./basecoll.js'),
      su              = require('./su.js')
 
class User extends BaseColl {

  constructor(db) {   
    
    super(db , User.name.toLowerCase(), BaseColl.PK_TYPE.SEQ) 
    
    const _               = this 
    
    _.mobileNo            = '9964102240'  // Unique constraint and create index on this
    _.firstName           = ''
    _.lastName            = ''
    _.dob                 = 0
    _.gender              = ''
    _.emailId             = ''
    _.userName            = '' 
    _.password            = ''

    _.additionalEmailIds  = []
   
    Object.seal(_)
  } 
    
  upsert (userData) {
    const _                  = this,    
          userName           = userData.userName
    let result = {}
    return _.findOne({userName: userName}, true).then(() => {
      
      if (_._id) { 
        let updObj = { 
        } 
        
        return _.update(updObj).then(() => { 
          return result
        }) 
      } 
      Object.assign(_, userData)
       
      return _.insert().then(() =>{ 
        return result
      })
    })
  } 

}  
  
module.exports =  User 
