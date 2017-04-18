
(function() {

  'use strict'
  
  function Array$(ar) {
    this.array = Array.isArray(ar) ? ar : []
  } 

  Array$.prototype = {

    
    indexOf: function (matchValOrFn, attr) {
      
      var index, 
          ar = this.array, 
          val,
          len = ar.length,
          fnMatch = (matchValOrFn instanceof Function) ? 
                    matchValOrFn : 
                    uBase.match.basic(matchValOrFn)
      
      for (index = 0; index < len; index++) {
        val = attr ? ar[index][attr] : ar[index]
        if (fnMatch(val, index, ar)) {
          return index
        }
      }
      
      return -1
      
    },

    lastIndexOf: function (matchValOrFn, attr) {
      
      var index, 
          ar = this.array, 
          val,
          len = ar.length,
          fnMatch = (matchValOrFn instanceof Function) ? 
                    matchValOrFn : 
                    uBase.match.basic(matchValOrFn)
      
      for (index = len - 1; index >= 0; index--) {
        val = attr ? ar[index][attr] : ar[index]
        if (fnMatch(val, index, ar)) {
          return index
        }
      }
      
      return -1
      
    },

    find: function (matchValOrFn, attr) {
      
      var index = this.indexOf(matchValOrFn, attr)
      return (index === -1) ? null : this.array[index]
      
    },

    findLast: function (matchValOrFn, attr) {
      
      var index = this.lastIndexOf(matchValOrFn, attr)
      return (index === -1) ? null : this.array[index]
      
    },
    
    indexOfComposite: function (obj) {
      
      var ar      = this.array, 
          keys    = Object.keys(obj),
          kLength = keys.length,
          len  = ar.length, i, key, item, index
      
      for (index = 0; index < len; index++) {
        item = ar[index]
        for (i = 0; i < kLength; i++) {
          key = keys[i]
          if (obj[key] !== item[key]) break
        }
        if (i === kLength) return index
      }
      
      return -1
    },
    
    max: function(attr) {
      
      var ar      = this.array, 
          len  = ar.length, item, index, val, max = Number.MIN_VALUE
      
      for (index = 0; index < len; index++) {
        item = ar[index]
        val  = Number(attr ? item[attr] : item)
        if (max < val) max = val            
      }
      return max
    },
    
    swap: function(from, to) {
      var ar = this.array,
          fromItem = ar[from]
      
      ar[from] = ar[to]
      ar[to] = fromItem
    },
    
    // ##findAll(matchValOrFn, attr)
    // Finds and returns an array of all matching objects.

    findAll: function (matchValOrFn, attr) {
      
      var index, 
          ar = this.array, 
          outAr = [],
          rec,
          val,
          len = ar.length,
          fnMatch = (matchValOrFn instanceof Function) ? 
                    matchValOrFn : 
                    uBase.match.basic(matchValOrFn)
      
      for (index = 0; index < len; index++) {
        rec = ar[index]
        val = attr ? rec[attr] : rec
        if (fnMatch(val)) outAr.push(rec)
      }
      
      return outAr
    }, 

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
    
    // ###randomize()
    // Randomize array elements inplace   
    // If you wish to get a copy in new array, copy the array before invocation
    // array.slice(0)   
    // Returns: inplace randomized array
        
    randomize: function() {
      return this.array.sort(function () {
        return Math.random() - 0.5
      })
    },
    
    isEmpty: function() {
      return this.array.length === 0
    },
    
    // ###equals(inAr, attr)
    // equals compares two array for data equality using identity.   
    // attr if set, the check is performed only on that property otherwise checks 
    // the full array element   
    // Returns: true if equal
    
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

    // ###equalsIgnoreOrder(inAr)
    // equalsIgnoreOrder compares two array contents ignoring the order/index . array items can also be Objects.   
    // Returns: true if equal
    
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
--------------------------------------------------------------------------------
  D A T E   S U P P O R T
--------------------------------------------------------------------------------
*/ 
    
  function Date$(dt) {
    this.date = dt
  }
  
  Date$._months = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December']
    
  /* All globally available functions are added in the prototype */
  Date$.prototype = {
                       
    format: function(formatStr, tzOffset) {
      
      var dt      = this.date,
          months  = Date$._months,
          time
      
      if (tzOffset !== undefined) {
        time = dt.getTime() + (dt.getTimezoneOffset() - tzOffset) * 60 * 1000
        dt = new Date(time)
      }
      
      // +? is a non-greedy repeat
      return formatStr.replace(/%\w+?%/g, function(token) {
        function get12Hour(date) {
          var hours = date.getHours()
          if (hours > 12) hours -= 12
          if (hours === 0) hours = 12
          return hours
        }
        
        function doubleDigit(val) {
          return ('0' + String(val)).slice(-2)
        }
        
        token = token.slice(1, -1)
        
        switch (token) {
        case 'yyyy':
          return dt.getFullYear()
        case 'yy':
          return doubleDigit(dt.getFullYear())
        case 'y':
          return Number(doubleDigit(dt.getFullYear()))
        case 'mmmm':
          return months[dt.getMonth()]
        case 'mmm':
          return months[dt.getMonth()].substr(0, 3)
        case 'mm':
          return doubleDigit(dt.getMonth()+1)
        case 'm':
          return dt.getMonth()+1
        case 'dd':
          return doubleDigit(dt.getDate())
        case 'd':
          return dt.getDate()
        case 'hh': // max 23
          return doubleDigit(dt.getHours())
        case 'h':
          return dt.getHours()
        case 'HH': // max 12
          return doubleDigit(get12Hour(dt))
        case 'H':
          return get12Hour(dt)
        case 'MM': 
        case 'nn': 
          return doubleDigit(dt.getMinutes())
        case 'M':
        case 'n': 
          return dt.getMinutes()
        case 'SS': 
        case 'ss': 
          return doubleDigit(dt.getSeconds())
        case 'S':
        case 's':
          return dt.getSeconds()
        case 'ms':
          return ('00' + String(dt.getMilliseconds())).slice(-3)
        case 'am':
        case 'pm':
          return dt.getHours() > 11 ? 'pm' : 'am'
        case 'AM':
        case 'PM':
          return dt.getHours() > 11 ? 'PM' : 'AM'
        default:
          return '%' + token + '%'
        }
      })
    },
    
    set: function(str, formatStr, tzOffset) {
      var regEx     = new RegExp('%\\w+?%', 'g'), 
          date      = this.date,
          foundPM   = false, 
          foundHH   = false, 
          ptrRegEx  = 0, 
          ptrStr    = 0, 
          token, num, time, ampm, match
      
      function getNumber(maxDigits) {
        var r = new RegExp('\\d{1,' + maxDigits + '}'),
            strNum = r.exec(str.substr(ptrStr))
        if (strNum !== null) {
          ptrStr += strNum[0].length
          return Number(strNum)
        }
        return null
      }
      
      function doMonth(short) {
        var months = Date$._months, 
            mon, i
        for (i = 0; i < 12; i++) {
          mon = (short ? months[i].substr(0, 3) : months[i]).toLowerCase()
          if (str.substr(ptrStr, mon.length).toLowerCase() === mon) {
            ptrStr += mon.length
            date.setMonth(i)
            break
          }
        }
      }
      
      while ((match = regEx.exec(formatStr)) != null) {
        if (match.length !== 1) break
        match = match[0]
        ptrStr += (regEx.lastIndex - ptrRegEx) - match.length
        ptrRegEx = regEx.lastIndex
        token = String(match.slice(1, -1))
        
        switch (token) {
        case 'yyyy':
        case 'yy':
        case 'y':
          num = getNumber(token.length === 4 ? 4 : 2)
          if (num !== null) {
            if (num < 100) num += 2000
            date.setFullYear(num)
          }
          break
          
        case 'mmmm':
        case 'mmm':
          doMonth(token === 'mmm')
          break
          
        case 'mm':
        case 'm':
          num = getNumber(2)
          if (num !== null) date.setMonth(num - 1)
          break
          
        case 'dd':
        case 'd':
          num = getNumber(2)
          if (num !== null) date.setDate(num)
          break
          
        case 'hh': // max 23
        case 'h':
          num = getNumber(2)
          if (num !== null) date.setHours(num)
          break
          
        case 'HH': // max 12
        case 'H':
          num = getNumber(2)
          if (num !== null) {
            date.setHours(num === 12 ? 0 : num)
            foundHH = true
          }
          break
          
        case 'MM': // max 23
        case 'M':
        case 'nn':
        case 'n':
          num = getNumber(2)
          if (num !== null) date.setMinutes(num)
          break
          
        case 'SS': // max 23
        case 'S': 
        case 'ss':
        case 's':
          num = getNumber(2)
          if (num !== null) date.setSeconds(num)
          break
          
        case 'ms': // max 999
          num = getNumber(3)
          if (num !== null) date.setMilliseconds(num)
          break
          
        case 'am':
        case 'AM':
        case 'PM':
        case 'pm':
          ampm = str.substr(ptrStr, 2).toLowerCase()
          if ((ampm === 'am') || (ampm === 'pm')) {
            ptrStr += 2
            if (ampm === 'pm') foundPM = true
          }
          break
          
        default:
          ptrStr += match.length
        }
      } // end while
      if (foundPM && foundHH) {
        date.setHours(date.getHours()+12)
      }
      
      if (tzOffset !== undefined) {
        time = date.getTime() + (date.getTimezoneOffset() + tzOffset) * 60 * 1000
        date.setTime(time)
      }
      
      return this
    },
    
    msTimePart: function() {
      var dt = new Date(this.date.getTime())
      dt.setHours(0, 0, 0, 0)
      return this.date.getTime() - dt.getTime()
    },
    
    elapsed: function(toTime) {
      if (toTime === undefined) {
        toTime = +new Date()
      } else if (toTime instanceof Date) {
        toTime = +toTime
      }
      var temp = toTime - this.date.getTime()
      var msPart = temp % 1000
      temp = (temp - msPart) / 1000
      var secPart = temp % 60
      temp = (temp - secPart) / 60
      var minPart = temp % 60
      temp = (temp - minPart) / 60
      var hourPart = temp % 24
      temp = (temp - hourPart) / 24
      var daysPart = temp
      
      function joinParts(part1, part1Text, part2, part2Text) {
        var buff = part1
        buff += (part1 > 1) ? ' ' + part1Text + 's' : ' ' + part1Text
        if (part2 === 0) return buff
        buff += ' ' + part2
        buff += (part2 > 1) ? ' ' + part2Text + 's' : ' ' + part2Text
        return buff
      }
      
      
      if (daysPart) {
        return joinParts(daysPart, 'day', hourPart, 'hour')
      } else if (hourPart) {
        return joinParts(hourPart, 'hour', minPart,  'min')
      } else if (minPart) {
        return joinParts(minPart, 'min', secPart, 'sec')
      } else if (secPart) {
        return (secPart + msPart / 1000).toFixed(1)  + ' secs'
      } else {
        return msPart + ' ms'
      }
    },
    
    secSince: function() {
      
      var dt = this.date,
          msecs = (+new Date() - dt.getTime())/1000
      
      return msecs.toFixed(3)
    },
    
    age: function (years) {
      
      var dt = this.date,
          ts
      
      if (years) {
        ts = dt.getTime() - 31557600000 * years
        this.date = new Date(ts)
        return ts
      }
      return Math.floor((Date.now() - dt.getTime()) / (31557600000))
    },
    
    equals: function(dt) {
      return this.date.getTime() === dt.getTime()
    },
    
    toString: function(msFlag) {
      const fmt = msFlag ? '%mm%/%dd% %hh%:%MM%:%ss%:%ms%' : '%dd%/%mm%/%yy% %hh%:%MM%:%ss%'
      return this.format(fmt, uBase.getLogTZOffset())
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
    
    /*
      A generic object serializer with lots of assumptions on structure
      skip logic:
        1. _         : names starting with underscore
        2. undefined : when values are undefined
        3. function  : value of type function are skipped
        
      if a value is of type object and it has function serialize. It is called
      
      function returns null if there is no serializable field is found
    */
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
    
    /*
      Sibling of serialize (Destination object dObj, Source : sObj)
      
      Assumption: 
        - dObj is already initialized (ideally a class object)
        - If a field in dObj holds instance of another class that provides 
          deserialize function. The field should already be initialized with new of 
          that class
        - sObj is ideally something that you got from serialize above
      
      field skip logic on dObj:
        1. _         : No field names with _ are touched
        2. undefined : sObj undefined are left untouched
        3. function  : sObj value of type function are skipped
        
      if a value in dObj id of type object and it has function deserialize. It is called
    */
    
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
    
    // mu({t:true, f:false, dec:1.1, z:0, s:'b', n:null, u:undefined, d:new Date(), 
    // o:{x:1, s:'s', y:{a:1, b:2}}, r:/ab/}).toString();
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
          //console.log('toString did not match', obj.toString, ({}).toString)
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
    
    /* Simulates Array.some of properties of Object
      fn is called like fn(obj[key], key, obj)
    */
    some: function(fn) {
      
      var _ = this.object, key = null
      
      for (key in _) {
        if (_.hasOwnProperty(key)) {
          if (fn(_[key], key, _)) return true
        }
      }
      return false
    },
    
    /* Simulates Array.map of properties of Object
      fn is called like fn(obj[key], key, obj)
    */
    map: function(fn) {
      
      var _ = this.object, key = null, out = []
      
      for (key in _) {
        if (_.hasOwnProperty(key)) {
          out.push((fn(_[key], key, _)))
        }
      }
      return out
    },
    
    // We must ensure that gen function does not return a promise, rather it should
    // yield for that promise result and return that result
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

    // ###equalsIgnoreOrder(other)
    // equalsIgnoreOrder compares two objects ignoring the order of any key value at deep nested level.    
    // Returns: true if equal
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
      
  /* All globally available functions are added in the prototype */
  Function$.prototype = {
      
    /*
      * This is for subclassing from a parent class. See example in ubasetest.js
      * call like mu(childClass).setParent(ParentClass)
      * 
      * Things to remember in using this:
      * - It should be possible to create an instance from ParentClass without 
      *   passing any parameters (like new ParentClass()), otherwise pass an instance
      * - No data variables in prototype (it doesn't make sense anyway)
      * - Only the functions defined in the prototype are inherited. The 
      *   instance functions will be added when the instance is created. This 
      *   is FYI without making any real difference in coding
      * - A subclass refers to parent by name like this.ParentClassName
      * - A subclass should construct the parent object by calling like
      *   this.ParentClassName(param). This must be the first line of code in the 
      *   subclass constructor.
      * - The ParentClassName is set using the Function.name property
      * 
      */                     
                          
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
      
      // Let us remove all the direct properties of parentObj
      for (key in parentObj) {
        if (parentObj.hasOwnProperty(key)) {
          delete parentObj[key]
        }
      }
      
      // Set prototype of child to the parent
      childClass.prototype = parentObj
      
      // Now let us populate the child prototype
      for (key in childProto) {
        if (childProto.hasOwnProperty(key)) {
          childClass.prototype[key] = childProto[key]
        }
      }
      childClass.prototype.constructor = childClass
      
      // We set default log functions, if class doesn't have custom log functions
      uBase(childClass).loggable()
      
      // Create a special Super function to get reference to the parent
      function Super() {
        
        var key = null, fn
        function SuperInstance() {
          // This is a super instance
        }
        
        ParentClass.apply(this, uBase([]).clone(arguments))
        this[ParentClass.name] = SuperInstance
        
        // Now add all the functions of parent's prototype to the super
        for (key in parentProto) {
          if (parentProto.hasOwnProperty(key)) {
            fn = parentProto[key]
            if (fn instanceof Function) SuperInstance[key] = fn.bind(this)
          }
        }
      }
      
      // finally attach the Super with parent's name to the child
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
    
    loggable: function (logId) {
      
      var cls = this.fn
      
      if (!logId) logId = cls.name
      
      if (!cls.prototype.hasOwnProperty('error'))
        cls.prototype.error = uBase.error.bind(uBase, logId)
      if (!cls.prototype.hasOwnProperty('warn'))
        cls.prototype.warn = uBase.warn.bind(uBase, logId)
      if (!cls.prototype.hasOwnProperty('log'))
        cls.prototype.log = uBase.log.bind(uBase, logId)
      if (!cls.prototype.hasOwnProperty('trace'))
        cls.prototype.trace = uBase.trace.bind(uBase, logId)
        
    },
    
    // Same signature as Object$.extend
    extend: function() {
      
      var o$ = new Object$(this.fn)
      
      return o$.extend.apply(o$, uBase([]).clone(arguments))
      
    },
    
    /*
    Sometimes the async callbacks are called more than 1 time due to bug in
    implementors code. This is the guard to such situation
    
    contextObj (optional) is the object on which function is called
    */
    
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
  
/*
--------------------------------------------------------------------------------
  u B A S E : D E C L A R A T I O N S
--------------------------------------------------------------------------------
*/ 
  
  // All objects are frozen so that code mistakes can be caught easily
  if (Object.freeze) Object.freeze(Array$)
  if (Object.freeze) Object.freeze(String$)
  if (Object.freeze) Object.freeze(Date$)
  
  function uBase(arg) {
    if (Array.isArray(arg)) {
      return new Array$(arg) || null
    } else if (typeof(arg) === 'string') {
      return new String$(arg) || null
    } else if (typeof(arg) === 'number') {
      return new Number$(arg) || null
    } else if (typeof(arg) === 'boolean') {
      return new Boolean$(arg) || null
    } else if (arg instanceof Date) {
      return new Date$(arg) || null
    } else if (arg instanceof Function) {
      return new Function$(arg) || null
    } else if (typeof(arg) === 'object') {
      return new Object$(arg) || null
    }
  }

  

  const IGNORED_PROPERTIES = ['then', 'toBSON', 'inspect','_bsontype', 'serialize']
  
  function PropertyChecker() { }
  PropertyChecker.prototype = new Proxy({}, {
    get(target, propKey, receiver) {
      // resolvePromise of native checks availability of then
      if (typeof propKey !== 'symbol' &&  IGNORED_PROPERTIES.indexOf(propKey) === -1 && !(propKey in target)) {
        throw new ReferenceError('Unknown property: ' + propKey.toString())
      }
      return Reflect.get(target, propKey, receiver)
    }
  })

  class BaseClass extends PropertyChecker {

    constructor() {
      super()
    }

    trace() {
      uBase.trace(this.constructor ? this.constructor.name : '?', ...arguments)
    }

    log() {
      uBase.log(this.constructor ? this.constructor.name : '?', ...arguments)
    }

    warn() {
      uBase.warn(this.constructor ? this.constructor.name : '?', ...arguments)
    }

    error() {
      uBase.error(this.constructor ? this.constructor.name : '?', ...arguments)
    }

  }

  uBase.BaseClass = BaseClass

  /*
  --------------------------------------------------------------------------------
    L O G G I N G    S U P P O R T
  --------------------------------------------------------------------------------
  */ 
      
  function Logger() {
    
    var _ = this
    
    _.level           = 0
    _.levelText       = ['ERROR', 'WARN', 'INFO', 'TRC']
    _.levelMap        = {ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3, TRACE: 3}
    _.consoleLogging  = true
    _.externalLogger  = null
    _.lastLogTime     = 0
    _.tzOffset        = -330 // india
   
    _.setLogLevel('debug') // Means debugging message (called by log)
  }
    
  Logger.prototype = {
                      
    setLogLevel: function(level) {
      
      var _   = this
      level   = level.toUpperCase()
      _.level = _.levelMap[level] === undefined ? 2 : _.levelMap[level]
    },
    
    setLogTZOffset: function(offset) {
      
      var _   = this,
          dt  = new Date()

      if (dt.getTimezoneOffset() !== offset) _.tzOffset = offset
    },
    
    getLogTZOffset: function() {
      
      var _   = this
      return _.tzOffset
    },
    
    setExtLogger: function(logger) {
      
      var _            = this
      _.externalLogger = logger
    },
                      
    /* 
     * logStruct:
     * 
     *  level   : level of the requested log 0, 1, 2, 3
     *  cat     : category of log
     *  tag     : tag of the log
     *  args    : log info array 
     *  caller  : this used to call us
     * 
     */
    log: function(logStruct) {
      
      var _           = this,
          logger      = _.externalLogger,
          consoleLog  = _.consoleLogging,
          curTime     = new Date(),
          curTS       = curTime.getTime(),
          strTime     = uBase(curTime).format('%dd%/%mm% %hh%:%MM%:%ss%.%ms%', _.tzOffset),
          tag         = logStruct.tag,
          timeDiff    = curTS - _.lastLogTS || 0, buffer
      
      function durationStr(ms) {
        
        if (ms < 10)  return '  ' + ms
        if (ms < 100) return ' ' + ms
        if (ms < 1000) return ms.toString()
        if (ms < 10000) return (ms / 1000).toFixed(1)
        return '+++'
      }
          
      _.lastLogTS = curTS
      strTime += ' [' + durationStr(timeDiff) + ']'
      
      buffer = logStruct.args.reduce(function(buf, val) {
        var strVal
        if (logger && logger.expand && (strVal = logger.expand(val))) {
          // already done
        } else if (val instanceof Error) {
          strVal = val.stack
        } else if (val && (typeof(val) === 'object')) {
          strVal = new Object$(val).toString(2)
        } else {
          strVal = String(val).trim()
        }
        return buf + ' ' + strVal
      }, '')
      
      if (logger) logger.log(logStruct.level, tag, buffer, strTime)
      if (consoleLog) _.logToConsole(logStruct.level, tag, buffer, strTime)
      return buffer
    },
    
    logToConsole: function(level, tag, msg, strTime) {
      
      var _       = this,
          initStr = _.levelText[level] + ' ' + strTime
            
      if (tag) initStr += ' ' + tag
      msg = initStr + ' => ' + msg
      
      
      /*eslint no-console: ["error", { allow: ["log", warn", "error", "info"] }] */
      if (level <= _.levelMap.ERROR && console.error) return console.error(msg)
      if (level <= _.levelMap.WARN &&  console.warn)  return console.warn(msg)
      if (level <= _.levelMap.INFO &&  console.info)  return console.info(msg)
      if (console.log) return console.log(msg)
    }
  }
  
  uBase._logger = new Logger()
  
  uBase.trace = function() { // logging level 3
    
    var logger  = uBase._logger, args, 
        catName = 'TRACE',
        thisLevel = logger.levelMap[catName]
    
    if (logger.level < thisLevel) return
    
    args = Array.prototype.slice.call(arguments)
    
    return logger.log({
      level   : thisLevel,
      tag     : args.shift(),
      args    : args,
      caller  : this,
      cat     : catName
    })
  }
  
  uBase.log = function() { // logging level 2
    
    var logger  = uBase._logger, tag, args, 
        catName = 'INFO',
        thisLevel = logger.levelMap[catName]
    
    if (logger.level < thisLevel) return
    
    args = Array.prototype.slice.call(arguments)
    
    // hack to support old version of logging
    tag = typeof args[0] === 'string' ? args.shift() : ''
    
    return logger.log({
      level   : thisLevel,
      tag     : tag,
      args    : args,
      caller  : this,
      cat     : catName
    })
  }
  
  uBase.warn = function() { // logging level 1
    
    var logger  = uBase._logger, args, 
        catName = 'WARN',
        thisLevel = logger.levelMap[catName]
    
    if (logger.level < thisLevel) return
    
    args = Array.prototype.slice.call(arguments)
    
    return logger.log({
      level   : thisLevel,
      tag     : args.shift(),
      args    : args,
      caller  : this,
      cat     : catName
    })
  }
  
  uBase.error = function() { // logging level 0
    
    var logger  = uBase._logger, args, 
        catName = 'ERROR',
        thisLevel = logger.levelMap[catName]
    
    if (logger.level < thisLevel) return
    
    args = Array.prototype.slice.call(arguments)
    
    return logger.log({
      level   : thisLevel,
      tag     : args.shift(),
      args    : args,
      caller  : this,
      cat     : catName
    })
  }
  
  uBase.setLogLevel = function(level) {
    uBase._logger.setLogLevel(level)
  }
  
  uBase.setLogTZOffset = function(offsetMin) { // india -330
    uBase._logger.setLogTZOffset(offsetMin)
  }
  
  uBase.getLogTZOffset = function() { // india -330  
    return uBase._logger.getLogTZOffset()
  }
  
  uBase.getLogLevelCode = function() {
    return uBase._logger.level
  }
  
  uBase.setLogger   = function(logger) {
    uBase._logger.setExtLogger(logger)
  }
  
  /* All globally available functions are added here */
  uBase.assert = function(result) {
    if (!result) {
      var args = uBase([]).clone(arguments)
      args.shift()
      throw(new UBaseError('ASSERTION_FAILED', uBase.concat.apply(uBase, args)))
    }
  }
  
  /*
  --------------------------------------------------------------------------------
    U T I L I T Y   F U N C T I O N
  --------------------------------------------------------------------------------
  */ 
      
  // The points are of type [lat, long]. Returns distance in km
  uBase.geoDistance = function(arFirstPt, arSecondPt) {
    
    function toRadian(n) { return n * Math.PI / 180 }
    
    var lat1 = arFirstPt[0],  long1 = arFirstPt[1],
        lat2 = arSecondPt[0], long2 = arSecondPt[1],
        dLat = toRadian(lat2-lat1),
        dLong = toRadian(long2-long1),
        sinDLat = Math.sin(dLat/2),
        sinDLong = Math.sin(dLong/2),
        cosLat1 = Math.cos(toRadian(lat1)),
        cosLat2 = Math.cos(toRadian(lat2)),
        a = sinDLat * sinDLat + sinDLong * sinDLong * cosLat1 * cosLat2,
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return 6371 * c
  }
  
  //CSV Reading
  uBase.CSVToArray = function(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ',')
    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
      (
          // Delimiters.
          '(\\' + strDelimiter + '|\\r?\\n|\\r|^)' +
          // Quoted fields.
          '(?:"([^"]*(?:""[^"]*)*)"|' +
          // Standard fields.
          '([^"\\' + strDelimiter + '\\r\\n]*))'
      ), 'gi')
    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]]
    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null
    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while ((arrMatches = objPattern.exec( strData))) {
      
      // Get the delimiter that was found.
      var strMatchedDelimiter = arrMatches[ 1 ]
      
      // Check to see if the given delimiter has a length
      // (is not the start of string) and if it matches
      // field delimiter. If id does not, then we know
      // that this delimiter is a row delimiter.
      if (strMatchedDelimiter.length &&
          (strMatchedDelimiter != strDelimiter) ) {
        // Since we have reached a new row of data,
        // add an empty row to our data array.
        arrData.push( [] )
      }
      
      // Now that we have our delimiter out of the way,
      // let's check to see which kind of value we
      // captured (quoted or unquoted).
      var strMatchedValue
      if (arrMatches[ 2 ]) {
        // We found a quoted value. When we capture
        // this value, unescape any double quotes.
        strMatchedValue = arrMatches[ 2 ].replace(
            new RegExp( '""', 'g' ), '"')
      } else {
        // We found a non-quoted value.
        strMatchedValue = arrMatches[ 3 ]
      }
      // Now that we have our value string, let's add
      // it to the data array.
      arrData[ arrData.length - 1 ].push( strMatchedValue )
    }
    // Return the parsed data.
    return( arrData )
  }

  // This function assumes that all json objects in the array has same keys
  uBase.jsonToCSV = function(json) {
    
    var arOut   = [], 
        arKeys, i, j, rec, arRec
    
    if (!json.length) return ''
    
    arKeys = Object.keys(json[0])
    arOut.push(arKeys)
    
    for (i=0; i < json.length; i++) {
      rec   = json[i]
      arRec = []
      for(j = 0; j < arKeys.length; j++) {
        arRec.push(rec[arKeys[j]])
      }
      arOut.push(arRec)
    }
    return uBase.arrayToCSV(arOut)
  }

  // This function finds keys from all json objects in the array
  uBase.varJsonToCSV = function(json) {
    
    var arOut   = [], 
        arKeys, i, j, rec, arRec, recKeys, key, val, idx
    
    if (!json.length) return ''
    
    arKeys = Object.keys(json[0])
    
    for (i=0; i < json.length; i++) {
      rec   = json[i]
      recKeys = Object.keys(rec)
      arRec = []
      for(j = 0; j < arKeys.length; j++) {
        key = arKeys[j]
        val = rec[key]
        arRec.push(val === undefined ? '' : val)
        if ((idx = recKeys.indexOf(key)) !== -1) recKeys.splice(idx, 1)
      }
      for(j = 0; j < recKeys.length; j++) {
        key = recKeys[j]
        val = rec[key]
        arRec.push(val === undefined ? '' : val)
        arKeys.push(key)
      }
      arOut.push(arRec)
    }
    arOut.unshift(arKeys)
    return uBase.arrayToCSV(arOut)
  } 
//   uBase.csvJSON = function(csv){

//   var lines=csv.split("\n");

//   var result = [];

//   var headers=lines[0].split(",");

//   for(var i=1;i<lines.length;i++){

// 	  var obj = {};
// 	  var currentline=lines[i].split(",");

// 	  for(var j=0;j<headers.length;j++){
// 		  obj[headers[j]] = currentline[j];
// 	  }

// 	  result.push(obj);

//   }
  
//   //return result; //JavaScript object
//   return JSON.stringify(result); //JSON
// }
  
  
  uBase.arrayToCSV = function(inpArray, nestingLevel, dmtr) {
    
    var fnEscape = function(str) {
      return (str.match(/[\,\"\n]/)) ? '"' + str.replace(/\"/g, '""') + '"' : str
    }
    
    dmtr = dmtr || ','
    
    /*
     * Nesting level 0 does not need the output to be escaped. Joined by \r\n
     * Nesting level 1 needs escaping and joined by , Nesting level 2 doesn't need
     * escaping and joined by , Nesting level 3 does not make sense
     * 
     */
    nestingLevel = nestingLevel || 0
    if (nestingLevel === 3) return '3rd level nesting of arrays does not make sense for CSV conversion'
    var arOut = []
    
    inpArray.forEach(function(item, index) {
      if (item === undefined || item === null) item = ''
      var value = Array.isArray(item) ? uBase.arrayToCSV(item, nestingLevel + 1, dmtr) : 
                                        (item || item === 0) ? item.toString() : ''
      arOut[index] = (nestingLevel === 1) ? fnEscape(value) : value
    })
    
    return arOut.join(nestingLevel === 0 ? '\n' : dmtr)
  }
  
  /*
   * This function converts an array to JSON (Object)
   * The first valid row must be the key to identify column names  
   * If keyColIndex is provided returned object is object otherwise array 
   */
  
  uBase.arrayToJSON = function(ar, keyColIndex) {
    
    var hasKey = keyColIndex !== undefined,
        json = hasKey ? {} : [],
        index = 0, 
        keys = null, arItem, item, j, rowIndex = 0
    
    function isRowEmpty(row) {
      for (var i = 0; i < row.length; i++) {
        if (row[i]) return false
      }
      return true
    }
        
    while ((arItem = ar[index++]) != null) {
      
      if (hasKey && !arItem[keyColIndex]) continue
      if (isRowEmpty(arItem)) continue
      
      if (!keys) {
        keys = arItem
      } else {
        item = {}
        for (j = 0; j < arItem.length; j++) {
          if (hasKey && keyColIndex === j) continue
          item[keys[j]] = arItem[j]
        }
        json[hasKey ? arItem[keyColIndex] : rowIndex++] = item
      }
    }
    return json
  }
  
  uBase.parseJSON = function(json, isArray, returnStringOnFailedParse) {
    
    if (uBase.assert) uBase.assert(isArray !== undefined) 
    var retVal = isArray ? [] : {}
    
    if (!json) return retVal // null, '', 0, undefined etc
    
    if (typeof json === 'object') return json
    
    if (typeof json === 'string') {
      try {
        return JSON.parse(json)
      } catch (err) {
        uBase.log('failed in parsing json', json)
        return returnStringOnFailedParse ? json : retVal
      }
    }
    return retVal
  }
  
  uBase.toArrayFromJson = function(json) {
    json = parseJsonSafe(json)
    return Array.isArray(json) ? json : []
  }
  
  uBase.toObjectFromJson = function(json) {
    json = parseJsonSafe(json)
    return uBase.isObject(json) ? json : {}
  }
  
  function parseJsonSafe(json) {
    
    if (typeof(json) === 'string') {
      try {
        json = JSON.parse(json)
      } catch (err) { /* */}
    }
    return json
  }
  
  // Check whether obj is {} object or not, basically handle null and array
  uBase.isObject = function(obj) {
    if (!obj || Array.isArray(obj)) return false
    return typeof(obj) === 'object'
  }
  
  /*
   * timeout: 0 - execute now
   * timeout -1 - wait forever
   * 
   */
  uBase.defer = function(fn, timeout) {
    
    var fnList = uBase.defer.fnList = uBase.defer.fnList || [],
        arItem = uBase(fnList).find(uBase.match.basic(fn), 'fn')
    
    function execute(fun) {
      var fnList = uBase.defer.fnList,
          index = uBase(fnList).indexOf(uBase.match.basic(fun), 'fn')
      
      if (uBase.assert) uBase.assert(index !== -1)
      
      var item = fnList[index]
      // uBase.log('uBase.defer', 'Calling deferred function');
      item.fn()
      fnList.splice(index, 1)
    }
    
    if (!arItem) {
      // uBase.log('uBase.defer', 'found new function');
      fnList.push(arItem = {fn:fn, timer:null})
    } else if (arItem.timer) {
      // uBase.log('uBase.defer', 'Reusing old function');
      clearTimeout(arItem.timer)
      arItem.timer = null
    }
    
    if (timeout > 0) {
      arItem.timer = setTimeout(execute.bind(null, fn), timeout)
      return uBase.defer.bind(uBase, fn, timeout)
    } else if (timeout === 0) {
      execute(fn)
      return null
    }
  } 
  
  /*
   * Example:
   * function getBalance(accountNo, /* currency, dateFormat * /) {
   * 
   *   var oArg = {currency: String, dateFormat: String}
   *   mu.variableArgs(arguments, oArg, 1)
   * 
   * }
   * 
   * It is also possible to have special cases like:
   * - any type by saying []
   * - any one of a type. example: [String, Number] or {is:[String, Number]}
   * - not of types. example {not: [String, Number]}
   */
  
  uBase.variableArgs = function(args, objArg, fixedArgCount) {
    
    var keys = Object.keys(objArg),
        argIndex = fixedArgCount || 0, 
        objIndex = 0,
        key, thisArgType, thisArg
    
    // Checks the isNot condition
    
    
    function isNotCheck(val, type) {
      
      // if object and 'is' property it is same as array situation
      if (type.is) type = type.is
      
      // If it is a constructor return
      if (typeof(type) !== 'object') return false
      
      if (Array.isArray(type)) {
        if (type.length === 0) return true 
        return type.indexOf[val.constructor] !== -1 ? true : false
      } else if (type.not) {
        if (Array.isArray(type.not)) {
          return type.not.indexOf(val.constructor) === -1 ? true : false
        }
        return type.not !== val.constructor
      } else {
        return false
      }
    }
    
    while ((key = keys[objIndex++]) != null) {
      
      // If we have got undefined at a place, we will assume the caller wants the 
      // variable to be set as undefined
      thisArg     = args[argIndex]
      thisArgType = objArg[key]
      
      if (argIndex >= args.length || thisArg === undefined || thisArg === null) {
        objArg[key] = undefined
        argIndex++
        continue
      }
      
      
      if (thisArg.constructor === thisArgType || isNotCheck(thisArg, thisArgType)) {
        objArg[key] = args[argIndex]
        argIndex++
      } else {
        objArg[key] = undefined
      }
    }
    return objArg
  }
  
  /* A function to make xor a boolean operator 
     true , true  : false *** or gives this true, all other match **
     false, false : false
     true , false : true
     false, true  : true
  */
  
  uBase.xor = function(a, b) {
    
    if (typeof(a) !== 'boolean') a = !!a
    if (typeof(b) !== 'boolean') b = !!b
    
    return ((a && !b) || (!a && b))
  }
  
  /*
    This function converts any value to String
  */
  uBase.stringify = function(val) {
    
    if (typeof val === 'string')  return val
    if (typeof val === 'number')  return String(val)
    if (val === undefined)        return 'undefined'
    if (val === null)             return 'null'
    
    if (val instanceof Array || val.toString === Object.prototype.toString) {
      return JSON.stringify(val)
    }
    
    return val.toString()
  }

  /*
    A log like concatenator to join multiple params in a string
  */
  uBase.concat = function() {

    var ar = uBase([]).clone(arguments)

    return ar.reduce(function(buf, val) {
      var strVal
      if (val instanceof Error) {
        strVal = val.stack
      } else if (val && (typeof(val) === 'object')) {
        strVal = new Object$(val).toString(2)
      } else {
        strVal = String(val).trim()
      }
      return buf + ' ' + strVal
    }, '')
  }

  
  /*
  --------------------------------------------------------------------------------
    P R O M I S E    S U P P O R T
  --------------------------------------------------------------------------------
  */ 
  
  // Small hack to convert callbacks into promise
  uBase.promiseFn = function(callback, okResult) {
    
    if (callback) return callback
    
    function wrapper() {

      var args   = uBase([]).clone(arguments),
          result = args.shift()
      
      if (result === undefined || result === null || result === okResult) {
        wrapper.resolve.apply(null, args)
      } else {
        args.unshift(result)
        wrapper.reject.apply(null, args)
      }
      return wrapper.promise
    }
    
    wrapper.promise = new Promise(function(resolve, reject) {
      // this is executed in sync
      wrapper.resolve = resolve
      wrapper.reject = reject
    })
    
    return wrapper
  }
  
  /*
   
   Call like:
     mu.promiseChain(_, fn1, fn2 ....)
     mu.promiseChain(_, [fn1, fn2 ....])
     mu.promiseChain(_, [item1, item2 ....], fn)
   
   Here: fn is a sync function that gives result OR returns a promise
         _ is the context for calling fn (this in fn will resolve to _)
   
  */
  uBase.promiseChain = function() {
    
    var arFn        = uBase([]).clone(arguments),
        defaultThis = arFn.shift(),
        curPtr      = 0,
        logging     = false, arTemp, func, type, log, temp
        
    if (logging) {
      temp = defaultThis ? defaultThis.constructor.name  + '_' : '' 
      log = uBase.log.bind(uBase, 'promiseChain', 
                     temp + uBase(1).random(10))
    }
        
    return new Promise(function(resolve, reject) {
      
      function callfn(fn, args) {
        
        var ret
        
        try {
          if (logging) log('callfn:try', {ptr:curPtr})
          ret = fn.apply(defaultThis, args)
        } catch (e) {
          if (logging) log('callfn:catch', {ptr:curPtr}, e)
          if (logging && e && e.stack) uBase.log(e.stack)
          reject(e)
          return
        }
        
        Promise.resolve(ret).then(function() {
          
          try {
            var args = uBase([]).clone(arguments)
            
            if (++curPtr === arFn.length) {
              if (logging) log('then:finished', {ptr:curPtr})
              resolve.apply(null, args)
            } else {
              if (logging) log('then:next', {ptr:curPtr})
              return callfn(arFn[curPtr], args)
            }
          } catch (e) {
            if (logging) log('then:catch', {ptr:curPtr}, e)
            if (logging && e && e.stack) uBase.log(e.stack)
            reject(e)
          }
          
        }).catch(function (e) {
          
          if (logging) log('otherwise', {ptr:curPtr})
          if (logging && e && e.stack) uBase.log(e.stack)
          reject(e)
        })
      }
      
      if (arFn.length === 1 && Array.isArray(arFn[0])) {
        // we have got array of functions
        arFn = arFn[0]
        type = 'Array of functions'
        
      } else if (arFn.length === 2 && Array.isArray(arFn[0]) && typeof(arFn[1]) === 'function') {
        // If we have been passed an array and a function
        arTemp = arFn[0]
        func   = arFn[1]
        
        arFn = arTemp.map(function (item) {
          return func.bind(defaultThis, item)
        })
        type = 'Array'
      } else {
        type = 'Many function params'
      }
      
      if (logging) log({type: type, count: arFn.length})
      
      if (arFn.length === 0) {
        resolve()
      } else {
        callfn(arFn[curPtr])
      }
    })
  }

  /*

    promisified functions when called return a promise instead of callback
    the last parameter for the function is assumed to be callback 
    with signature fn(err, ....) 
    
    Basically Node Style fn can be promisified
    

   */
  
  uBase.promisify = function(/*fn, context, param1, param2 */) {
    var arInitParam = uBase([]).clone(arguments),
        fn          = arInitParam.shift(),
        context     = arInitParam.shift() || null
    
    return function() {
      
      var arSecParam  = uBase([]).clone(arguments),
          secondThis  = this
      
      return new Promise( function(resolve, reject) {
        
        function cb() {
          
          var arData = uBase([]).clone(arguments),
              err    = arData.shift()
              
          if (err) return reject(err)
          resolve.apply(null, arData)
        }
        
        arSecParam = arInitParam.concat(arSecParam)
        try {
//          uBase.log('promisify calling ', fn.name || fn.toString().substr(0, 40))
//          uBase.log('Params', arSecParam)
          arSecParam.push(cb)
          fn.apply(context !== undefined ? context : secondThis, arSecParam)
        } catch (e) {
          reject(e)
        }
      })
    } || null
  }
  
  /*
    promiseParallel: Executes 'n' instances of fn in parallel
    Param: 
      ar: An array of parameters to be passed to fn
      fn: A function that would accept one param from ar at a time
      optional context: to simulate context.fn(param) 
  */
  uBase.promiseParallel = function(ar, fn, context) {
    
    if (context) fn = fn.bind(context)
    ar = ar.map(function(param) {
      return fn(param)
    })
    
    return Promise.all(ar)
  }
  
  /*
    promiseSeries: Executes 'n' instances of fn in series
    Param: 
      ar: An array of parameters to be passed to fn
      fn: A function that would accept one param from ar at a time
      optional context: to simulate context.fn(param) 
  */
  uBase.promiseSeries = function(ar, fn, context) {
    
    ar = ar.map(function(param) {
      return fn.bind(context || null, param)
    })
    
    return uBase.promiseChain(null, ar)
  }

  // fn must return a promise
  uBase.delayedPromise = function(fn, msTimeout) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        fn().then(function() {
          resolve()
        }).catch(function(err) {
          reject(err)
        })
      }, msTimeout)
    })
  }

  function co(gen) {
    
    var ctx   = this,
        slice = Array.prototype.slice,
        args  = slice.call(arguments, 1)

    function toPromise(obj) {
      if (!obj) return obj
      if (isPromise(obj)) return obj
      if (isGeneratorFunction(obj) || isGenerator(obj)) return co.call(this, obj)
      if ('function' == typeof obj) return thunkToPromise.call(this, obj)
      if (Array.isArray(obj)) return arrayToPromise.call(this, obj)
      if (isObject(obj)) return objectToPromise.call(this, obj)
      return obj
    }        

    function thunkToPromise(fn) {
      var ctx = this
      return new Promise(function (resolve, reject) {
        fn.call(ctx, function (err, res) {
          if (err) return reject(err)
          if (arguments.length > 2) res = slice.call(arguments, 1)
          resolve(res)
        })
      })
    }

    function arrayToPromise(obj) {
      return Promise.all(obj.map(toPromise, this))
    }

    function objectToPromise(obj){
      var results = new obj.constructor()
      var keys = Object.keys(obj)
      var promises = []
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
        var promise = toPromise.call(this, obj[key])
        if (promise && isPromise(promise)) defer(promise, key)
        else results[key] = obj[key]
      }
      return Promise.all(promises).then(function () {
        return results
      })

      function defer(promise, key) {
        // predefine the key in the result
        results[key] = undefined
        promises.push(promise.then(function (res) {
          results[key] = res
        }))
      }
    }

    function isPromise(obj) {
      return 'function' == typeof obj.then
    }

    function isGenerator(obj) {
      return 'function' == typeof obj.next && 'function' == typeof obj.throw
    }

    function isGeneratorFunction(obj) {
      var constructor = obj.constructor
      if (!constructor) return false
      if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true
      return isGenerator(constructor.prototype)
    }

    function isObject(val) {
      return Object == val.constructor
    }

    // we wrap everything in a promise to avoid promise chaining,
    // which leads to memory leak errors.
    // see https://github.com/tj/co/issues/180
    return new Promise(function(resolve, reject) {
      if (typeof gen === 'function') gen = gen.apply(ctx, args)
      if (!gen || typeof gen.next !== 'function') return resolve(gen)

      onFulfilled()

      /**
       * @param {Mixed} res
       * @return {Promise}
       * @api private
       */

      function onFulfilled(res) {
        var ret
        try {
          ret = gen.next(res)
        } catch (e) {
          return reject(e)
        }
        next(ret)
        return null
      }

      /**
       * @param {Error} err
       * @return {Promise}
       * @api private
       */

      function onRejected(err) {
        var ret
        try {
          ret = gen.throw(err)
        } catch (e) {
          return reject(e)
        }
        next(ret)
      }

      /**
       * Get the next value in the generator,
       * return a promise.
       *
       * @param {Object} ret
       * @return {Promise}
       * @api private
       */

      function next(ret) {
        if (ret.done) return resolve(ret.value)
        var value = toPromise.call(ctx, ret.value)
        if (value && isPromise(value)) return value.then(onFulfilled, onRejected)
        return onFulfilled(value)
        /*return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, '
          + 'but the following object was passed: "' + String(ret.value) + '"'))*/
      }
    })
  }

  uBase.co = co

/*
--------------------------------------------------------------------------------
  G E N E R I C   M U B B L E   E R R O R    O B J E C T
--------------------------------------------------------------------------------
*/ 
  function UBaseError(code, msg, data) {
    
    if (code instanceof Error) {
      this.name     = code.name
      this.message  = msg ? msg : code.message
      this.stack    = code.stack
    } else {
      this.name     = code || 'UnknownError'
      this.message  = msg || ''

      var stack     = (new Error()).stack,
          ar        = stack.split('\n')

      if (ar.length > 2) {
        ar[0] = this.name
        ar[1] = this.message.substr(0, 80)
      }

      this.stack    = ar.join('\n')
    }
    this.data = data
  }
  
  UBaseError.prototype              = Object.create(Error.prototype)
  UBaseError.prototype.constructor  = UBaseError
  uBase.MubbleError                 = UBaseError
  
/*
--------------------------------------------------------------------------------
  V A L I D A T O R 
--------------------------------------------------------------------------------
*/ 
  uBase.vxr = {
    digits: function(noOfDigits, mandatory) {
      return function(val, fieldName) {
        fieldName = fieldName ? fieldName + ': ' : ''
        if (typeof(val) !== 'number') val = Number(val)
        if (isNaN(val)) 
          return fieldName + 'invalid number'
        if ((!mandatory) && (!val)) return
        if (Math.floor(val) !== val) 
          return fieldName +' not a whole number'
        if (val.toString().length !== noOfDigits) 
          return fieldName + 'should have ' + noOfDigits + ' digits'
        
        return null // success
      }
    },
    
    regEx: function(expr, msg, mandatory) {
      if (!msg) msg = 'Invalid format'
      return function(val, fieldName) {
        fieldName = fieldName ? fieldName + ': ' : ''
        if (typeof(val) !== 'string') val = String(val)
        if ((!mandatory) && (!val)) return
        if (!val.match(expr)) 
          return fieldName + msg
        
        return null // success
      }
    },
    
    key: function(mandatory) {
      return uBase.vxr.regEx(/^[A-Z0-9_]*$/, 'only uppercase alpha-numeric or underscore allowed', 
         mandatory)
    },
    
    password: function(mandatory) {
      return uBase.vxr.regEx(/^\S*$/, 'blank space not permitted', 
         mandatory)
    },
    
    email: function(mandatory) {
      var pattern = /^[^@]+@[^@]+\.[^@]+$/
      return uBase.vxr.regEx(pattern, 'invalid email id', mandatory)
    },
    
    // ???? India only val due to +91
    mobile: function(mandatory) {
      var pattern = /^(\+91)*\d{10}$/
      return uBase.vxr.regEx(pattern, 'invalid mobile no', mandatory)
    }
  }
  
/*
--------------------------------------------------------------------------------
  F O R M A T O R 
--------------------------------------------------------------------------------
*/ 
  uBase.fxr = {
    date: function(format) {
      return function(val) {
        var dt
        if (val instanceof Date) dt = val
        else if (typeof(val) === 'number') dt = new Date(val)
        else if (!isNaN(Number(val))) dt = new Date(Number(val))
        else return val
        return uBase(dt).format(format)
      }
    },
     
    age: function() {
      return function(val) {
        var dt
        if (val instanceof Date) dt = val
        else if (typeof(val) === 'number') dt = new Date(val)
        else if (!isNaN(Number(val))) dt = new Date(Number(val))
        else return val
        return uBase(dt).age()
      }
    },
     
    decimal: function(digitsAfterDec) {
      return function(val) {
        var num = (typeof(val) === 'number') ? val : Number(val)
        return num ? num.toFixed(digitsAfterDec) : ''
      }
    },
    
    capitalize: function() {
      return function(val) {
        val = String(val || '')
        return uBase(val).capitalize()
      }
    },
    
    firstN: function(n) {
      return function(val) {
        val = String(val || '')
        return val.substr(0, n)
      }
    },
    
    dummy: null
  }

  
  /*
  --------------------------------------------------------------------------------
    A R R A Y    M A T C H E R
  --------------------------------------------------------------------------------
  */ 
  // Class level functions, instantiation not required for these
/* jshint unused: false */
  uBase.match = {
    basic: function (refVal) {
      return function(val/*, index, ar */) {
        return (refVal === val)
      }
    },
    
    // `a$.match.loosely(refVal) to match with ==`
    loosely: function (refVal) {
      var bool = (typeof(refVal) === 'boolean') ? true : false
      return function(val/*, index, ar */) {
        /* jshint eqeqeq: false */
        return bool ? (refVal ? !!val : !val) : (refVal == val)
        /* jshint eqeqeq: true */
      }
    },
    
    equals: function (refVal) {
      
      var canEqual = Array.isArray(refVal) || (refVal && typeof(refVal) === 'object')
      return function(val/*, index, ar */) {
        return canEqual ? uBase(refVal).equals(val) : refVal === val
      }
    },
    
    // `a$.match.ignoreCase(refString) to match strings ignoring the case`
    ignoreCase: function (refVal) {
      
      if (typeof(refVal) !== 'string') return null
      refVal = refVal.toLowerCase()
      
      return function (val /*, index, ar */) {
        return (typeof(val) === 'string') ? (refVal === val.toLowerCase()) : false
      }
    },
    
    // `a$.match.range(minVal, maxVal) to match numbers for a range`
    range: function (minVal, maxVal) {
      
      if ((typeof(minVal) !== 'number') || (typeof(maxVal) !== 'number')) return null
      
      return function (val/*, index, ar */) {
        if (typeof(val) !== 'number') return false
        return (val >= minVal) && (val <= maxVal) ? true : false
      }
    },
     
    // See if value is a truth
    truthy: function () {
      return function (val/*, index, ar */) {
        return !!val
      }
    },

    rx: function(regEx) {

      if (!RegExp instanceof RegExp) return null
      return function(val) {
        return regEx.test(val)
      }
    }
  }
/* jshint unused: true */
  
  /*
  --------------------------------------------------------------------------------
    T R A N S F O R M : From any type to desired type
  --------------------------------------------------------------------------------
  */ 
  uBase.tfm = {
    str: function(s) {
      if (typeof(s) === 'string') return s.trim()
      if (typeof(s) === 'number') return String(s)
      return ''
    },
               
    lc: function(s) {
      return uBase.tfm.str(s).toLowerCase()
    },
    
    uc: function(s) {
      return uBase.tfm.str(s).toUpperCase()
    },
    
    capitalize: function(s) {
      return uBase(uBase.tfm.str(s)).capitalize()
    },
    
    mobNo: function(s) {
      return s.trim().replace(/\D/g, function(match, pos) { 
        return ((pos === 0) && (match === '+')) ? '+' : '' 
      })
    }
    
  }
  
  /*
  --------------------------------------------------------------------------------
    C L A S S E S
  --------------------------------------------------------------------------------
  */
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
  
  //             ALL DONE LET'S FREEZE AND REGISTER

  if (Object.freeze) Object.freeze(uBase)
                    
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = uBase
  } else if (typeof window !== 'undefined') {
    window.su = window.uBase = uBase
  }

})()

