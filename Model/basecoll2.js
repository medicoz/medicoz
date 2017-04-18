/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    BaseColl For all collections in the system
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */                     

'use strict'

var su            = require('./su.js'),
    ObjectID      = require('mongodb').ObjectID

function BaseColl(db, collectionName, pkType) {

  var _ = this
  
  if (su.assert) su.assert(collectionName && pkType)

  // Common fields in all the tables
  _._id      = null
  _.createTS = 0
  _.deleted  = false 
  _.db       = db

  // holds most recent values for create, modify or delete
  _.modTS    = 0 
  _.modUid   = 0
  
  _._collectionName  = collectionName
  
  // Primary key type
  _._pkObjId = pkType === BaseColl.PK_TYPE.OBJECT_ID ? true : false 
  _._pkSeq   = pkType === BaseColl.PK_TYPE.SEQ       ? true : false
  _._pkCode  = pkType === BaseColl.PK_TYPE.CODE      ? true : false
  
  _._autoFields = ['createTS', 'deleted', 'modTS', 'modUid', 'modLoc']
  _._logDBCalls = false
}

BaseColl.RECORD_NOT_FOUND       = 'RECORD_NOT_FOUND'
BaseColl.RECORD_ALREADY_EXISTS  = 'RECORD_ALREADY_EXISTS'
BaseColl.PK_NOT_SET             = 'PRIMARY_KEY_NOT_AVAILABLE'

BaseColl.PK_TYPE       = {
  OBJECT_ID : 'OBJECT',
  SEQ       : 'SEQ',
  CODE      : 'CODE' // Use this for composite keys too
}

su(BaseColl.prototype).extend({
  
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Basic DB Operations
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */   

  // Get by primary key                    
  get: function(id /* columns, ignoreRNF - record not found */) {
    
    var _    = this,
        oArgs = {columns: Object, ignoreRNF: Boolean}
    
    if (su.assert) su.assert(id !== undefined, 'PK not given for get')
    su.variableArgs(arguments, oArgs, 1)
    id = _._pkObjId && typeof(id) === 'string' ? new ObjectID(id) : id
    
    return _.findOne({_id: id}, oArgs.columns, oArgs.ignoreRNF)
    
  },

  // Finds the first record by criteria (usually unique) from database     
  findOne: function(selCrit /* columns, sort, ignoreRNF - record not found */) {
    
    var _      = this, 
        startTS = Date.now(),
        bcCol   = _._getCollection(),
        options = {},
        oArgs   = {columns: Object, sort: Object, ignoreRNF: Boolean} 

    
    su.variableArgs(arguments, oArgs, 1)
    if (oArgs.columns) options.fields = oArgs.columns
    if (oArgs.sort)    options.sort   = oArgs.sort
    
    return bcCol.findOne(selCrit, options).then(function(rec) { 

      if (!rec) {
        if(oArgs.ignoreRNF) return true
        throw(BaseColl.RECORD_NOT_FOUND)
      }
      _.deserialize(rec)
      return false
      
    }).catch(function(err) {
      throw(err)
    })
  },
  
  // Insert record in the database
  insert: function (/*insertTime, ignoreDupRec */) {
    
    var _       = this,
        bcCol   = _._getCollection(),
        oArgs   = {insertTime: Number, ignoreDupRec: Boolean},
        startTS = Date.now(), pr
    
    su.variableArgs(arguments, oArgs)
    
    if (!_._pkObjId && !_._pkSeq) {
      if (su.assert) su.assert(_._id)
    }
    
    pr = (!_._id && _._pkSeq) ? _.getNextSequence() : Promise.resolve(null)
    
    return pr.then(function(seq) {
      
      var newRec
      if (seq) _._id = seq
      newRec  = _.getInsertRec(oArgs.insertTime)
      delete newRec['db']
      _._logDBCalls && console.log(_._collectionName + '/insert', newRec) 

      return bcCol.insert(newRec, {w: 1}).then(function(resp) {
        
        if (resp.insertedCount !== 1) {
          if(oArgs.ignoreDupRec) return true
          throw(BaseColl.RECORD_ALREADY_EXISTS)
        }
        
        if (!_._id) _._id = resp.insertedIds[0] 
        return false
      })
    }).catch(function(err) {
      console.log('encountered error while insert', err)
      if (err.code === 11000) {
        if(oArgs.ignoreDupRec) return null
        throw(BaseColl.RECORD_ALREADY_EXISTS)
      }
      throw(err)
    })
  },
  
  update: function(updRec/*, updTime, unsetRec*/) {
    
    var _       = this,
        oArgs   = {updTime: Number, unsetRec: Object},
        pkRec   = {_id: _._id}
    
    su.variableArgs(arguments, oArgs, 1)
    return _.updateInternal(pkRec, updRec, oArgs.updTime, oArgs.unsetRec)
  },
  
  custosupdate: function(selCrit, updSpec) {
    
    let _       = this,
        startTS = Date.now(),
        bcCol   = _._getCollection() 

        
    return bcCol.update(selCrit, updSpec).then((res) => { 
      if (res) return null
    })
  },
  
  updateInternal: function(pkRec, updRec, updTime, unsetRec) {
    
    let _       = this,
        bcCol   = _._getCollection(),
        setRec, updSpec, logStr, keys
        
    if (su.assert) su.assert(pkRec._id !== undefined, 'PK not set for update')
    
    updTime = updTime || + new Date()
    
    keys = Object.keys(updRec)
    if (keys.length && keys[0].substr(0, 1) === '$') { // The update is written directly
      updSpec = updRec
      setRec = updSpec.$set = updSpec.$set || {}
    } else {
      updSpec = {}
      setRec = updSpec.$set = updRec
    }
    
    _.getUpdateSetRec(setRec, updTime)
    
    if (unsetRec) updSpec.$unset = unsetRec
    
    logStr = su(updRec).toString().substr(0, 500) 
    _._logDBCalls && console.log(_._collectionName + '/updateOne', pkRec, updSpec)
    
    return bcCol.updateOne(pkRec, updSpec, {w: 1}).then(function(resp) {
      
      if (resp.result.n !== 1) throw(BaseColl.RECORD_NOT_FOUND) 
      _.deserialize(setRec)
      if (unsetRec) _.unsetFromDb(unsetRec)
      
      return null
    })
  },

  
  // Get next sequence number for collection, ideally done before insert
  getNextSequence: function (seqCount, collectionName) {
    
    var _          = this, 
        db         = _.db,
        counterCol = db.collection('counter') 
        
    if (seqCount === undefined) seqCount = 1
    
    // 'new': true means that API returns modified object rather than original
    
    _._logDBCalls && console.log('counter/findOneAndUpdate', { $inc: {seq: seqCount}})
    return counterCol.findOneAndUpdate({_id: collectionName || _._collectionName}, 
    { $inc: {seq: seqCount}}, {w: 1, returnOriginal: false}).then(function(resp) {
      _._logDBCalls && console.log(resp)                                                
      return resp.value.seq 
    })
  },
  list: function(selCrit, project, sort) {
    var _      = this, 
        bcCol   = _._getCollection(), cursor
    
    _._logDBCalls && _.log(_._collectionName + '/find', selCrit, project, sort)
    cursor = bcCol.find(selCrit)
    if (project) cursor.project(project)
    if (sort)    cursor.sort(sort)
    
    return cursor.toArray().then(function(recs) {
      return recs
    })
  },
  listCursor: function(selCrit) {
    var _      = this,
        bcCol   = _._getCollection(), cursor

    _._logDBCalls && _.log(_._collectionName + '/find', selCrit, project, sort)
    cursor = bcCol.find(selCrit).batchSize(1000)

    return cursor
  },

  listcount: function(selCrit, project, sort, count) {
    var _      = this, 
        bcCol   = _._getCollection(), cursor
    
    // if (sortObject) {
    //   sort = []
    //   su(sortObject).some(function(val, key) {
    //     sort.push([key, val])
    //   })
    // }
    
    _._logDBCalls && _.log(_._collectionName + '/find', selCrit, project, sort)
    
    cursor = bcCol.find(selCrit).limit(count)
    
    if (project) cursor.project(project)
    if (sort)    cursor.sort(sort)
    
    return cursor.toArray().then(function(recs) {
      return recs
    })
  },
  
  count: function(selCrit) {
    
    var _       = this, 
        bcCol   = _._getCollection()
        
    // then callback has count in case of success
    _._logDBCalls && console.log(_._collectionName + '/count', selCrit)
    return bcCol.count(selCrit)
  },

  group : function(groupCrt) {
    
    var _     = this,
        bcCol = _._getCollection()
        
    // then callback has recs in case of success
    return bcCol.group(groupCrt.key, groupCrt.cond, groupCrt.initial,
                  groupCrt.reduce)
  },
  
  aggregate : function(selCrt) {
    
    var _     = this,
        bcCol = _._getCollection()
        
    return bcCol.aggregate(selCrt).toArray().then(function(recs) {
      return recs
    })
  },
  

  distinct: function(column, selCrit) {
    
    var _       = this, 
        bcCol   = _._getCollection()
    
    selCrit = selCrit || {}
            
    _._logDBCalls && console.log(_._collectionName + '/distinct', column, selCrit)
    return bcCol.distinct(column, selCrit).then(function(recs) {
      return recs
    })
  },

  direct: function() {
    
    var _         = this,
        bcCol     = _._getCollection(),
        params    = su([]).clone(arguments),
        fnNameStr = params.shift(),
        fn        = bcCol[fnNameStr]
        
    _._logDBCalls && console.log(_._collectionName + '/' + fnNameStr, params)
    return fn.apply(bcCol, params)
  },
  
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Function to manage indexes
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */   

  // This is abstract function that should be implemented by sub-classes to
  // define the indexes they need on their models
  myIndices: function(/*apiInfo*/) {
    return {}
  },
  
  getIndices: function() {
    
    var _         = this,
        bcCol     = _._getCollection()
        
    return bcCol.indexes()
  },

  
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Support Operations
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */   

  // Get Primary Key
  getKey: function() {
    var _ = this
    if (!_._id) return _._id
    return _._pkObjId ? _._id.toHexString() : _._id
  },
  
  // Set Primary Key
  setKey: function(key) {
    var _ = this
    _._id = _._pkObjId && typeof(key) === 'string' ? new ObjectID(key) : key
  },
  
  // Unset the object with fields removed from db      
  unsetFromDb: function(dbRec) {
    
    var _ = this
    
    su(dbRec).some(function(val, key) {
      _[key] = undefined
    })
    
  },
  
  serialize: function() {
    
    // Serialize is towards DB. Hence the Object id needs to be retained as ObjectID
    
    var _ = this
    
    var rec = su(_).serialize()
    if (_._id) rec._id = _.getKey()
    return rec
  },
  
  deserialize: function(obj, arSrcCols) {
    
    var _ = this
    
    if (!obj) return
    
    if (obj._id) _.setKey(obj._id)
    return su(_).deserialize(obj, null, arSrcCols)
  },

  // insert rec can be a model rec or a normal object
  getInsertRec: function(insertTime, insertRec) {
    
    var _       = this 

    if (!insertRec) insertRec = _    
    
    insertTime = insertTime || +new Date()
    
    insertRec.createTS = insertTime
    insertRec.modTS    = insertTime

    return insertRec instanceof BaseColl ? insertRec.serialize() : insertRec.serialize()
  },
  
  getUpdateRec: function(updateTime) {
    
    var _      = this,
        updRec = _.serialize()
    
    return _.getUpdateSetRec(updRec, updateTime)
  },
  
  getUpdateSetRec: function(rec, updateTime) {
    
    var _       = this,
        session = _._ai.session
    
    updateTime = updateTime || +new Date()
    
    rec.modTS    = updateTime
    rec.modUid   = session ? session.userId : 0
    
    // we set the location if it is known
    if (_._ai.loc) rec.modLoc = _._ai.loc
    // rec.modLoc   = _._ai ? _._ai.loc : null
    
    return rec
  },
  
  getExportRec: function(pkName, arExclude) {
    
    var _         = this,
        exportObj = _.serialize(), i = 0, field
    
    while ((field = _._autoFields[i++])) delete exportObj[field]
    
    if (arExclude) {
      i = 0
      while ((field = arExclude[i++])) delete exportObj[field]
    }
    
    if (pkName) {
      delete exportObj._id
      exportObj[pkName] = _.getKey()
    }
    return exportObj
  },
  
  // A quick way to get auto columns to ignore when listing records
  getIgnoreColList: function() {
    return this._autoFields.reduce(function(obj, name) {
      obj[name] = 0
      return obj
    }, {})
  },
  
  // Get ignored cols list as array
  getIgnoreCols: function() {
    return this._autoFields
  },

  getModelName: function() {
    return this._collectionName
  },
  
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Utility functions
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */   
  // A quick way to get auto columns to ignore when listing records
  toString: function() {
    
    var _ = this, obj = {}
    
    su(_).some(function(val, key) {
      if (key.substr(0, 1) === '_') return
      if (_._autoFields.indexOf(key) !== -1) return
      obj[key] = val
    })
    
    return _._collectionName + '#' + _._id + '==>' + su(obj).toString()
  },
  
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Internal functions
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */   
  
  _getCollection: function() {  
    return this.db.collection(this._collectionName)
  }
                     
})

module.exports = BaseColl
  