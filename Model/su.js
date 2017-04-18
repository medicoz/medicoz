
(function() {

  'use strict'
  
  function Array$(ar) {
    this.array = Array.isArray(ar) ? ar : []
  } 

  Array$.prototype = { 
    sort: function(sortCriteria, ascending) {
      
      var sortFn, mult, arAttr = [], obj
      
      function attrComp(a, b) {
        
        
        var i, attr, mult, valA, valB
        
        for (i = 0; i < arAttr.length; i++) {
          attr    = arAttr[i].attr
          mult    = arAttr[i].mult
          valA    = a[attr]
          valB    = b[attr]
          
          if (valA === valB) continue
          return (valA > valB ? 1 : -1) * mult
        }
        return 0
      }
      
      function regComp(a, b) {
        return (a < b) ? -1 * mult : (a > b) ? 1 * mult : 0
      }
      
      if (sortCriteria instanceof Function) {
        
        sortFn = sortCriteria
        
      } else if (sortCriteria === undefined) {
        
        sortFn = regComp
        mult   = 1
        
      } else if (typeof(sortCriteria) === 'boolean') {
        
        sortFn = regComp
        mult   = sortCriteria ? 1 : -1
        
      } else if (typeof(sortCriteria) === 'string') {
        
        sortFn = attrComp
        obj    = {attr: sortCriteria, mult: ascending ? 1 : -1}
        arAttr.push(obj)
        
      } else { // we have object or array here
      
        sortFn = attrComp
        
        uBase(sortCriteria).some(function(val, key) {
          
          if (typeof(val) === 'string') { // ['attr1', 'attr2']
          
            obj    = {attr: val, mult: ascending ? 1 : -1}
            arAttr.push(obj)
            
          } else if (typeof(val) === 'boolean') { // {attr1: true, attr2: false}
          
            obj    = {attr: key, mult: val ? 1 : -1}
            arAttr.push(obj)
            
          } else if (uBase.isObject(val)) { // [{attr1: true}, {attr2: false}]
          
            uBase(val).some(function(val1, key1) {
              obj    = {attr: key1, mult: val1 ? 1 : -1}
              arAttr.push(obj)
            })
          }
        })
      }
      
      return this.array.sort(sortFn)
    },
    
    // wrapper for Array.some to me able to use Array or Object with same signature  
    some: function(fn) {
      var _ = this.array
      return _.some(fn)
    }, 

    isEmpty: function() {
      return this.array.length === 0
    }, 

    equals: function(inAr, attr) {
      
      if(this.array === inAr) return true
      
      var a , b,
          ar = this.array,
          len = ar.length

      if ((!Array.isArray(inAr)) || (len !== inAr.length)) return false
      
      return ar.every((item, i) => {
        
        a = attr ? item[attr]    : item
        b = attr ? inAr[i][attr] : inAr[i]

        return (Array.isArray(a) || a instanceof Object) ? uBase(a).equals(b) : (a === b)
      })
    },
    
    equalsIgnoreOrder: function(inAr) {
      
      function lexicalSort(a , b){
        const astr = JSON.stringify(a),
              bstr = JSON.stringify(b)
          
        if(astr < bstr) return -1
        else if(astr >bstr) return 1
        else return 0    
      }

      function sortedClone(item){
        
        if (!(item instanceof Object)) return item
        
        // Array
        if(Array.isArray(item)){
          return item.map( x => sortedClone(x)).sort(lexicalSort) // default sorting is lexical
        }
        // Object
        const ret = {} ,
              keys = Object.keys(item).sort() // keys sorting is must

        for(const key of keys){
          ret[key] = sortedClone(item[key])
        }     
        return ret
      }
 
      if(this.array === inAr) return true
      
      var ar = this.array,
          len = ar.length

      if ((!Array.isArray(inAr)) || (len !== inAr.length)) return false
      
      const selfClone  = sortedClone(ar),  
            otherClone = sortedClone(inAr)  
      
      // Objects are deeply lexically sorted . smart check again is unnecessary. 
      return uBase(selfClone).equals(otherClone)
    },
    
      
    // ###join(sep, last)
    // Joins array elements using sep for all element except last  
    // element   
    // example `a$([1,2,3]).join(', ', ' and ') => 1, 2 and 3`      
    // Returns: joined string
    
    join: function(sep, last) {
      
      var ar = this.array,
          len = ar.length,
          lastDone = false
      
      if (len === 0) return ''
      if (typeof(sep) !== 'string') sep = ', '
      if (typeof(last) !== 'string') last = sep
      
      return String(ar.reduceRight(function (previous, current/*, index, array */) {
        if (!lastDone) {
          lastDone = true
          return current + last + previous
        }
        return current + sep + previous
      }))
    },

    // ###duplicates
    // duplicates(attr): check duplicates in an array either whole element or 
    // a property of element  
    // Returns: array with duplicates (only one copy of each duplicate)
    
    duplicates: function(attr) {
      
      var ar = this.array,
          dup = [], 
          obj = {}
      
      function hashString(object) {
        
        var keys = Object.keys(object),
            len = keys.length
            
        return len ? len + ':' + object[keys[0]] + ':' + 
                        object[keys[len - 1]] : 'empty object'
      }
          
      function checkAndPrepare(item) {
        
        var refVal = attr ? item[attr] : item, 
            key, 
            oldValue
            
        key = refVal && (typeof(refVal) === 'object') && 
              (refVal.constructor === obj.constructor) ? hashString(refVal) : 
                                                         String(refVal)
                                                         
        if (!(oldValue = obj[key])) {
          obj[key] = [refVal]
        } else if (oldValue.indexOf(refVal) === -1) {
          oldValue.push(refVal)
        } else if (dup.indexOf(refVal) === -1) {
          dup.push(refVal)
        }
      }
          
      ar.forEach(checkAndPrepare)
      return dup
    },
    
    clone:function(ar) {
      return Array.prototype.slice.call(ar || this.array)
    },
    
    append: function(ar) {
      if (Array.isArray(ar)) Array.prototype.push.apply(this.array, ar)
    },

    // get number of matches in two sorted arrays of numbers
    matchCount: function(b) {
      var i = 0, 
          j = 0, 
          matches = 0, 
          a = this.array
      
      while((a[i] !== undefined) && (b[j] !== undefined)) {
        if (a[i] === b[j]) {
          i++; j++; matches++
        } else if (a[i] > b[j]) {
          j++
        } else {
          i++
        }
      }
      return matches
    },
    
    serialize: function() {
      if (uBase.assert) uBase.assert(this._itemConstructor, 'You must provide function to deserialize item')
      return (new Object$(this.array)).serialize()
    },
    
    deserialize: function(obj) {
      if (uBase.assert) uBase.assert(this._itemConstructor, 'You must provide function to deserialize item');
      (new Object$(this.array)).deserialize(obj, this._itemConstructor)
      return this
    },
    
    itemConstructor: function(fn) {
      this._itemConstructor = fn
      return this
    },
    
    itemClass: function(Cls) {
      this._itemConstructor = function() {
        return new Cls()
      }
      return this
    },
    
    toString: function(level) {
      var obj = new Object$(this.array)
      return obj.toString(level)
    },
    
    log: function(str) {
      
      var _ = this.array,
          len = _.length, i
      
      uBase.log(str || 'Array', 'items:', len)
      for (i = 0; i < len; i++) {
        uBase.log(_[i])
      }
    },
    
    // equivalent of async.series. Exacts node signature
    // itemFn(cb, item, lastRetVal)
    // cb(err, retVal)
    // finalFn(err, retVal)
    
    series: function(itemFn, finalFn, initialValue) {
      
      var ar  = this.array,
          len = ar.length, i = 0
      
      function doAnItem(err, retVal) {
        if ((i >= len) || err) {
          return finalFn && finalFn(err, retVal)
        }
        itemFn(doAnItem, ar[i], retVal)
        i++
      }
      
      if (uBase.assert) uBase.assert(typeof(itemFn) === 'function')
      doAnItem(null, initialValue)
    },
    
    mapObj: function(pkAttr) {
      
      var _   = this.array,
          obj = {}
      
      _.forEach(function(item) {
        
        var pk = item[pkAttr]
        if (typeof(pk) === 'object') {
          pk = JSON.stringify(pk)
        }
        obj[pk] = item
      })
      return obj
    },
    
    diff: function(ar) {
      
      var _  = this.array
      return _.filter(function(i) {return ar.indexOf(i) < 0})
    },
    
    // We must ensure that gen function does not return a promise, rather it should
    // yield for that promise result and return that result
    coMap: function(gen) {

      const _ = this.array

      return Promise.all(_.map((item, index) => {
        return uBase.co(gen, item, index, _)
      }))
    }
    
  },

  // The constructor for array-mod.  
  // example: `a$([1,2,3])`
  Array$.self = function(ar) {
    return new Array$(ar)
  }
  
/*
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  S T R I N G   S U P P O R T
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/ 
    
  function String$(str) {
    this.string = str
  }
    
  /* All globally available functions are added in the prototype */
  String$.prototype = {
                       
    unCamel: function() {
      var str = this.string,
          out = str.replace(/^\s*/, '')  // strip leading spaces
      out = out.replace(/^[a-z]|[^\s]?[A-Z]/g, function(strPart, offset) {
        if (offset === 0) {
          return(strPart.toUpperCase())
        } else if (strPart.length === 1) {
          return(' ' + strPart)
        } else { // length 2
          return(strPart.substr(0,1) + ' ' + strPart.substr(1).toUpperCase())
        }
      })
      return(out)
    },
    
    camel: function() {
      
      var str = this.string,
          parts = str.trim().split(/\s+/),
          out = parts.shift(),
          i = 0, part
      
      out = out.substr(0, 1).toLowerCase() + out.substr(1)
      while ((part = parts[i++]) !== undefined) {
        out += part.substr(0, 1).toUpperCase() + part.substr(1)
      }
      return out
    },
    
    capitalize: function() {
      
      var text = this.string.trim()
      return text.replace(/\b\w+\b/g, function(word) {
        return word.substring(0, 1).toUpperCase() + word.substring(1)
      })
    },
    
    replace: function(mapObj) {
      var str = this.string
          
      if (!mapObj) return str
      
      return str.replace(/%\w+?%/g, function(token) {
        
        var val, toStr
        
        token = token.slice(1, -1)
        val = mapObj[token]
        
        if (val === undefined) return '%' + token + '%'
        if (val === null) return ''
        if (typeof(val) !== 'object') return val
        
        toStr = val.toString()
        return toStr === '[object Object]' ? JSON.stringify(val) : toStr
      })
    },
    
    startsWith: function(prefix, returnInvalid) {
      var str = this.string
      if (str.substr(0, prefix.length) === prefix) {
        return str.substr(prefix.length)
      }
      return returnInvalid ? str : null
    },
    
    equals: function(s) {
      return this.string === s
    },
    
    equalsIgnoreCase: function(s) {
      var str = this.string
      return str.toLowerCase() === s.toLowerCase()
    },
    
    contains: function(s) {
      var str = this.string.toLowerCase()
      if(str.indexOf(s.toLowerCase()) !== -1) {
        return true
      }  
      return false
    },
    
    repeat: function(count) {
      if (count < 0) return ''
      return new Array(count + 1).join(this.string)
    },
    
    unspecial: function() {
      return this.string.replace(/\W/g, '_')
    },
    
    toString: function() {
      return this.string.toString()
    },
    
    dummy: null
  }

  /*
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    B O O L E A N   S U P P O R T
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  */ 
      
  function Boolean$(bool) {
    this.bool = bool
  }
    
  /* All globally available functions are added in the prototype */
  Boolean$.prototype = {
                        
    equals: function(bool) {
      return this.bool === bool
    },
    
    toString: function() {
      return this.bool.toString()
    }
  }
  /*
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    N U M B E R   S U P P O R T
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  */ 
      
  function Number$(num) {
    this.number = num
  }
    
  /* All globally available functions are added in the prototype */
  Number$.prototype = {
                        
    random: function(maxExcluding) {
      if (!maxExcluding) maxExcluding = this.number
      return Math.floor(Math.random() * maxExcluding)
    },
    
    equals: function(num) {
      return this.number === num
    },
    
    toString: function() {
      return this.number.toString()
    },

    zeroPad: function(len) {
      const num  = String(this.number),
            slen = num.length
      return (len > slen ? '0'.repeat(len - slen) : '') + num
    },

    
    dummy: null
  }
    
  /*
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    O B J E C T   S U P P O R T
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  */ 
      
  function Object$(obj) {
    this.object = obj
  }
    
  /* All globally available functions are added in the prototype */
  Object$.prototype = {
                        
    isEmpty: function() {
      var obj = this.object, prop = null
      for (prop in obj) {
        if(obj.hasOwnProperty(prop))
          return false
      }
      return true
    },
    
    extend: function(from, noOverWrite) {
      var obj = this.object, prop = null
      for (prop in from) {
        if (from.hasOwnProperty(prop) && ((noOverWrite && (!obj[prop])) || (!noOverWrite)) )
          obj[prop] = from[prop]
      }
      
      // It is a prototype object
      if (obj.constructor && obj.constructor.prototype && obj === obj.constructor.prototype) {
        uBase(obj.constructor).loggable()
      }
      
      return obj
    },

    clone: function() { // shallow cloning
      var obj   = this.object, 
          ret   = {},
          prop
      for (prop in obj) {
        if (obj.hasOwnProperty(prop))
          ret[prop] = obj[prop]
      }
      return ret
    }, 

    serialize: function () {
      
      var o     = this.object,
          copy  = Array.isArray(o) ? [] : {},
          prop = null, val, letter1, count = 0
      
      for (prop in o) {
        
        if (o.hasOwnProperty(prop)) {
        
          letter1 = prop.substr(0, 1)
          val     = o[prop]
          
          if (letter1 === '_' || 
              val === undefined || 
              val instanceof Function) {
            continue
          }
          
          if (val && typeof(val) === 'object' && val.serialize instanceof Function) {
            val = val.serialize()
          }
          
          copy[prop] = val
          count++
        }
      }
      return count ? copy : null
    },
    
    deserialize: function (sObj, newItemConstructor /* default new items ignored */, arSrcCols) {
      
      var dObj  = this.object,
          prop = null, val, letter1, dval
  
      if (!sObj) return dObj
      
      for (prop in sObj) {
        
        if (sObj.hasOwnProperty(prop)) {
          
          if (arSrcCols && arSrcCols.indexOf(prop) === -1) continue
          
          letter1 = prop.substr(0, 1)
          val     = sObj[prop]
          dval    = dObj[prop]
          
          if (letter1 === '_' || 
              val === undefined || 
              (!newItemConstructor && !dObj.hasOwnProperty(prop)) ||
              val instanceof Function) {
            continue
          }
          
          if (!dObj.hasOwnProperty(prop)) { // new property
            if (typeof(newItemConstructor) === 'function') {
              dObj[prop] = newItemConstructor(val).deserialize(val)
            }
          } else if (dval && typeof(dval) === 'object' && dval.deserialize instanceof Function) {
            dObj[prop] = dval.deserialize(val)
          } else {
            dObj[prop] = val
          }
        }
      }
      return dObj
    },
    
    toString: function(level) {
      
      function toStr(obj, lvl) {
        
        var isArray = Array.isArray(obj),
            isSet   = obj instanceof Set,
            isMap   = obj instanceof Map,
            MAX_KEYS = 20,
            buffer  = '', str, value, len, valType, keys, keyLength

        if (isSet || isMap) {
          keys = obj.keys()
          keyLength = obj.size
        } else {
          keys = Object.keys(obj)
          keyLength = keys.length
        }
        
        if (!isArray && ((str = obj.toString()) !== '[object Object]')) {
          return str
        }
        
        for (const i of keys) {
          
          if (buffer)   buffer += ', '
          if (i === MAX_KEYS && keyLength - MAX_KEYS > 1) {
            buffer += (keyLength - MAX_KEYS) + ' more...'
            break
          }
          
          if (!isArray && !isSet) buffer += i + ':'
          
          value   = isSet ? i : (isMap ? obj.get(i) : obj[i])
          valType = typeof(value)
          
          if (valType === 'function') {
             
            str = value.name
            buffer += str ? str + '()' : value.toString().substr(0, 50)
            
          } else if ((!value) || (valType !== 'object')) {
            
            str = String(JSON.stringify(value))
            buffer += str.length > 50 ? str.substr(0, 50) + '..' : str
            
          } else {
            
            if (!lvl) {
              
              if (Array.isArray(value)) {
                len = value.length
                buffer += '[' + (len ? len + 'x' : '') + ']'
              } else {
                len = Object.keys(value).length
                buffer += '{' + (len ? len + 'x' : '') + '}'
              }
              
            } else {
              buffer += toStr(value, lvl - 1)
            }
          }
        }
        return isArray || isSet ? '[' + buffer + ']' : '{' + buffer + '}'
      }
        
      return toStr(this.object, level === undefined ? 2 : level)
    },
    
    // Portable version works for browser and node
    encodeQueryString: function() {
      
      var prop = null, obj = this.object, ar = []
      
      for (prop in obj) {
        if(obj.hasOwnProperty(prop)) {
          ar.push(encodeURIComponent(prop) + '=' + encodeURIComponent(obj[prop]))
        }
      }
      return ar.join('&')
    },
    
    some: function(fn) {
      
      var _ = this.object, key = null
      
      for (key in _) {
        if (_.hasOwnProperty(key)) {
          if (fn(_[key], key, _)) return true
        }
      }
      return false
    }, 

    map: function(fn) {
      
      var _ = this.object, key = null, out = []
      
      for (key in _) {
        if (_.hasOwnProperty(key)) {
          out.push((fn(_[key], key, _)))
        }
      }
      return out
    }, 

    coMap: function(gen) {

      var _ = this.object, key = null, out = []
      
      for (key in _) {
        if (_.hasOwnProperty(key)) {
          out.push(uBase.co(gen, _[key], key, _))
        }
      }
      return Promise.all(out)
    },

    equals: function(other) {
      
      if(this.object === other) return true
      if (!(other instanceof Object)) return false
      
      var _ = this.object,
          keys = Object.keys(_),
          oKeys = Object.keys(other)
      
      if (keys.length !== oKeys.length) return false
      
      return keys.every(function(key) {
        
        var val = _[key],
            oVal = other[key]
        
        if (Array.isArray(val)) return uBase(val).equals(oVal)
        if (val instanceof Object) return uBase(val).equals(oVal)
        return val === oVal
      })
    },

    equalsIgnoreOrder: function(other) {
      
      if(this.object === other) return true
      if (!(other instanceof Object)) return false
      
      var _ = this.object,
          keys = Object.keys(_),
          oKeys = Object.keys(other)
      
      if (keys.length !== oKeys.length) return false
      
      return keys.every(function(key) {
        
        var val = _[key],
            oVal = other[key]
        
        if (Array.isArray(val)) return uBase(val).equalsIgnoreOrder(oVal)
        if (val instanceof Object) return uBase(val).equalsIgnoreOrder(oVal)
        return val === oVal
      })
    },

    entries: function* entries() {

      var _ = this.object, key
      
      for (key in _) {
        if (_.hasOwnProperty(key)) {
          yield [key, _[key]]
        }
      }
    },
    
    dummy: null
  }
    
  /*
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    F U N C T I O N    S U P P O R T
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  */ 
      
  function Function$(obj) {
    this.fn = obj
  }
      
  Function$.prototype = {
      
    setParent: function(ParentClass, parentObj) {
        
      var childClass = this.fn,
          childProto = childClass.prototype,
          parentProto = ParentClass.prototype,
          key = null
        
      try {
        if (!parentObj) parentObj = new ParentClass()
      } catch (err) {
        uBase.log(err)
      }
      
      if (uBase.assert) uBase.assert(parentObj && !Object.isSealed(parentObj), 
          'Could not instantiate parent. Parent expects parameters or it is Object.sealed()')
      
      for (key in parentObj) {
        if (parentObj.hasOwnProperty(key)) {
          delete parentObj[key]
        }
      }
      
      childClass.prototype = parentObj
      
      for (key in childProto) {
        if (childProto.hasOwnProperty(key)) {
          childClass.prototype[key] = childProto[key]
        }
      }
      childClass.prototype.constructor = childClass
      
      uBase(childClass).loggable()
      
      function Super() {
        
        var key = null, fn
        function SuperInstance() {
        }
        
        ParentClass.apply(this, uBase([]).clone(arguments))
        this[ParentClass.name] = SuperInstance
     
        for (key in parentProto) {
          if (parentProto.hasOwnProperty(key)) {
            fn = parentProto[key]
            if (fn instanceof Function) SuperInstance[key] = fn.bind(this)
          }
        }
      }
      
      childClass.prototype[ParentClass.name] = Super
    },
    
    serializable: function () {
      
      var cls = this.fn
      if (!cls.prototype.serialize) {
        cls.prototype.serialize = function() {
          return uBase(this).serialize()
        }
      }
      if (!cls.prototype.deserialize) {
        cls.prototype.deserialize = function(obj) {
          return uBase(this).deserialize(obj)
        }
      }
    },
    
    extend: function() {
      
      var o$ = new Object$(this.fn)
      
      return o$.extend.apply(o$, uBase([]).clone(arguments))
      
    },
    
    callOnce: function(contextObj) {
      var func = this.fn, rememberFunc = func
      return function() {
        if(func) {
          func.apply(contextObj || null, uBase([]).clone(arguments))
          func = null
        } else {
          uBase.log('mu(fn).callOnce violated for code', rememberFunc.toString().substr(0, 100))
        }
      } || null
    },
    
    equals: function(fn) {
      return this.fn === fn
    },
    
    toString: function() {
      return this.fn.toString()
    },
    
    dummy: null
  }

  uBase.BaseClass = BaseClass

  uBase.cls = function(name, constructor) {
    var old = uBase.cls[name]
    if (old) {
      if (old !== constructor) {
        if (uBase.assert) uBase.assert(true, 'Registering multiple classes with name: ' + name)
      }
    }
    uBase.cls[name] = constructor
  }
 
  /*
  --------------------------------------------------------------------------------
    G L O B A L S
  --------------------------------------------------------------------------------
  */
  uBase.global = function(name, obj) {
    var old = uBase.global[name]
    if (old) {
      if (old !== obj) {
        if (uBase.assert) uBase.assert(true, 'Registering multiple globals with name: ' + name)
      }
    }
    uBase.global[name] = obj
  }
  
  if (Object.freeze) Object.freeze(uBase)
                    
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = uBase
  } else if (typeof window !== 'undefined') {
    window.su = window.uBase = uBase
  }

})()

