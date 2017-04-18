/*------------------------------------------------------------------------------
     USER
------------------------------------------------------------------------------*/ 
'use strict'

const BaseColl        = require('./basecoll.js'),
      su              = require('./su.js')
 
class Location extends BaseColl {

  constructor(db) {   
    
    super(db , Location.name.toLowerCase(), BaseColl.PK_TYPE.SEQ) 
    
    const _                 = this 
    
    _.userName              = ''  // Unique constraint and create index on this
    _.firstName             = ''
    _.lastName              = ''
    _.dob                   = 0
    _.gender                = ''
    _.emailId               = ''
    _.password              = ''
    _.address_components    = {}
    _.formatted_address     = ''
    _.lat                   = ''
    _.lng                   = '' 
    _.eventTs               = ''

    _.additionalEmailIds  = []
   
    Object.seal(_)
  } 
    
  upsert (userData) {
    const _                  = this,    
          eventTs          = Date.now()
    let result = {}
    return _.findOne({ eventTs: eventTs}, true).then(() => {
      
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
  
module.exports =  Location 
