(function() {

  /*global $, window, mu*/
  
  function basic (tag, classes, $parent, text) {
    var $elem = $('<' + tag + (classes ? ' class="' + classes + '"' : '') + 
                (text ? '>' + text + '</' + tag + '>' : '/>'))
    if ($parent) $elem.appendTo($parent)
    return $elem  
  } 
  class  UI  {
    constructor() { 
     
    }

    div (classes, $parent, arSize, arOffset) {
      var div = basic('div', classes, $parent);
      
      function docls(ar, pre) {
        var o = {l:0, m:0, s:0, x:0}, len = ar.length, strCls = '';
        switch (len) {
          case 1: o = {l:ar[0], m:ar[0], s:ar[0], x:ar[0]}; break;
          case 2: o = {l:ar[0], m:ar[0], s:ar[1], x:ar[1]}; break;
          case 3: o = {l:ar[0], m:ar[1], s:ar[2], x:ar[2]}; break;
          case 4: o = {l:ar[0], m:ar[1], s:ar[2], x:ar[3]}; break;
        }
        
        if (o.l !== '') strCls += ' col-lg-' + pre + o.l;
        if (o.m !== '') strCls += ' col-md-' + pre + o.m;
        if (o.s !== '') strCls += ' col-sm-' + pre + o.s;
        if (o.x !== '') strCls += ' col-xs-' + pre + o.x;
        
        div.addClass(strCls);
      }
      
      if (arSize) docls(arSize, '');
      if (arOffset) docls(arOffset, 'offset-');
      
      if ($parent) div.appendTo($parent);
      return div;
    } 

    panel (classes, $parent, hdrClass, ftrClass) {
      
      var div = $('<div class="panel ' + (classes || 'panel-default') +'"></div>');
      if (hdrClass !== undefined) $('<div class="panel-heading ' + hdrClass + 
                                   '"></div>').appendTo(div);
      $('<div class="panel-body"></div>').appendTo(div);
      if (ftrClass !== undefined) $('<div class="panel-footer ' + ftrClass + 
      '"></div>').appendTo(div);
      
      if ($parent) div.appendTo($parent);
      return div;
    } 
    
    panelHeader (classes, $parent, hdrClass) {
      var div = $('<div class="panel ' + (classes || 'panel-default') +'"></div>');
         $('<div class="panel-heading ' + hdrClass + '"></div>').appendTo(div);
        if ($parent) div.appendTo($parent);
        return div;
    }  
    tabs (classes, $parent, opts) {

      var ul = basic('ul', 'nav nav-tabs ' + classes, $parent, null),
          opt, index = 0;
      while (opt = opts[index++]) {
        /*jshint ignore:start*/
        $('<li class="' + (index === 1 ? "active" : "") + '"><a data-toggle="tab">' + opt + '</a></li>').appendTo(ul);
        /*jshint ignore:end*/
      }
      //$('li',ul).eq(index-2).addClass('disabled');
      $('li',ul).muOnClick(function(){
        if(!$(this).hasClass('disabled')){ 
          index = $(this).index();
          $('.tab-pane', $('.tab-content')).removeClass('active in');
          $('.tab-pane', $('.tab-content')).eq(index).addClass('active in');
          $('a', ul).eq(index).tab('show');
        }
      });
      
      return ul;
    } 

    pills (classes, $parent, opts) {
      var ul    = basic('ul', 'nav nav-pills '+ classes, $parent, null),
          index = 0, opt;
      
      while(opt = opts[index++])
        /*jshint ignore:start*/
        $('<li class="' + (index === 1 ? "active" : "") + '"><a data-toggle="tab">' + opt + '</a></li>').appendTo(ul);
      /*jshint ignore:end*/
      return ul;
    } 

    _ (tag, classes, $parent, text) {
      return basic(tag, classes, $parent, text);
    } 
    
    p (classes, $parent, text) {
      return basic('p', classes, $parent, text);
    }
    
    pre (classes, $parent, text) {
      return basic('pre', classes, $parent, text);
    } 
    
    code (classes, $parent, text) {
      return basic('code', classes, $parent, text);
    } 
    
    h1 (classes, $parent, text) {
        return basic('h1', classes, $parent, text);
    }
    
    
    h2 (classes, $parent, text) {
        return basic('h2', classes, $parent, text);
    } 
      
    h3 (classes, $parent, text) {
      return basic('h3', classes, $parent, text);
    } 
    
    h4 (classes, $parent, text) {
        return basic('h4', classes, $parent, text);
    }
      
    h5 (classes, $parent, text) {
        return basic('h5', classes, $parent, text);
    }
    
    btn (classes, $parent, text) {
      return basic('button', 'btn ' + classes, $parent, text);
    }
    
    faBtn (btnClasses, $parent, text, faclass) {
      var btn = basic('button', 'btn ' + btnClasses, $parent)
      basic('i', 'fa '+faclass, btn)
      btn.append(' '+text)
      return btn
    } 
    
    media (classes,$parent, tag, source){
      var $elem = $('<' + tag + (classes ? ' class="' + classes + '"' : '') + 
                ' src ="' + source + '"></' + tag + '>');
      if ($parent) $elem.appendTo($parent);
      return $elem;
    } 
    
    label (classes, $parent, text){
      return basic('label', classes, $parent, text)
    } 

    inp (classes, $parent, ph, type, ml, val, disable) {

      var inp = basic('input', 'form-control ' + (classes || ''), $parent);
      inp.attr('type', type || 'text');
      if (ph)  inp.attr('placeholder', ph);
      if (ml)  inp.attr('maxlength', ml);
      if (val || val == 0) inp.val(val) 
      if (disable) inp.attr('disabled', true);
      return inp 
    } 

    /*jshint ignore:start*/
    inpNumPassword (classes, $parent, ph, ml) {

      var inp = basic('input', 'form-control ' + (classes || ''), $parent);
      if (Modernizr.android) {
        inp.attr('type', 'number').css('-webkit-text-security', 'disc');
      } else {
        inp.attr('type', 'password');
        inp.attr('inputmode', 'numeric').attr('pattern', '[0-9]*');
      }
      if (ph) inp.attr('placeholder', ph);
      if (ml) inp.attr('maxlength', ml);
      return inp;
    } 
    /*jshint ignore:end*/
    spaninp (classes,$parent,type, valueofspan){
      var $elem = $('<input ' + (classes ? ' class="' + classes + '"' : '') + 
                    'type="' + type + '"' +'value="' + valueofspan + '"/>');
      if ($parent) $elem.appendTo($parent);
        return $elem;
    } 
    
    a (classes,$parent,url,text) {
      var $elem = $('<a ' + (classes ? ' class="' + classes + '"' : '') + 
                    'href="' + url + '"' + '>' + '<h4>' + text + '</h4></a>');
      if ($parent) $elem.appendTo($parent);
        return $elem;
    }
       
    aspan (classes,$parent,url,text) {
      var $elem = $('<a ' + (classes ? ' class="' + classes + '"' : '') + 
                    'href="' + url + '"' + '>' + '<span>' + text + '</span></a>');
      if ($parent) $elem.appendTo($parent);
        return $elem;
    }
   
    /*jshint ignore:start*/
    textarea (classes, $parent, rows, ph, val, disable) {
     
      var textarea = $('<textarea class="form-control '+ (classes || "")+'" rows="'+(rows || "") +
                      '" placeholder="'+ (ph || "")+'"/>');
     if (disable) textarea.attr('disabled', true) 
     if (val || val == 0) textarea.val(val)
     if ($parent) textarea.appendTo($parent);
     return textarea;
     
    } 
    /*jshint ignore:end*/
    
    btnGrp (classes, $parent, opts) {
      var div = basic('div','btn-group '+ classes, $parent),
      opt, index = -1;
      while(opt = opts[++index]){
        /*jshint ignore:start*/
        $('<button type="button" class="btn btn-default '+ (index === 1 ? "btn btn-primary" : "")+
          '">'+opt+'</button>').appendTo(div);
        /*jshint ignore:end*/
      }
        return div;        
    }
    
    btnLinkGrp (classes, $parent, opts) {
      
      var div = basic('div','btn-group '+ classes, $parent),
      opt, index = -1;
      while(opt = opts[++index]){
        /*jshint ignore:start*/
        $('<a class="btn btn-default '+ (index === 0 ? "btn-primary" : "")+
    		  '" role="button">'+opt+'</a>').appendTo(div);
        /*jshint ignore:end*/
      }
      
      $('a',div).muOnClick(function(){
          div.find('a.btn-primary').removeClass('btn-primary');
          $(this).addClass('btn-primary');
      });
      
        return div; 
    } 
    
    btnLinkCheckGrp (classes, $parent, opts, vals) {
      var div = basic('div','btn-group '+ classes, $parent),
      opt, index = 0;
      
      while(opt = opts[index]){
        $('<label class="btn btn-default btn-xs"><input type="checkbox" value="'+vals[index]+'">'+opt+
        '</label>').appendTo(div);
        index++
      }
      div.attr('data-toggle','buttons');
      return div;
    } 
    /*jshint ignore:start*/
    btnToggleRad (classes, $parent,opts){
      var $elem = $('<div class= "btn-group'+ classes + '" data-toggle="buttons">'),
          opt,index = 0;
      $('<label class="btn btn-primary">' +
        '<input type="radio" name="options" id="option1">' + opts[0] +
        '</label>').appendTo($elem);
    	while(opt = opts[++index]) {
    	  $('<label class="btn">' +
    	    '<input type="radio" name="options" id="option1">' + opt +
    			    '</label>').appendTo($elem);
    	}	
    	if ($parent) $elem.appendTo($parent);
        return $elem;
    }
    
    radio (classes, $parent, name, opts) {
    	
    	var div = basic('div',classes,'', null),
    		opt,index = 0;
    	while(opt = opts[index++]) {
    		$('<div class="radio"><label><input type="radio" name="' + name + '" value="' + 
          opt + '"/>' + opt + '</label>').appendTo(div);
    	}
    	if ($parent) div.appendTo($parent);
    	return div;
    }
    
    stars (classes, $parent, number, ratings, stored) {
      var div  = basic('div','clearfix', '', null),
          i    = 0, index,
          data = Array(number);
    	
    	for(i; i < number; i++) 
    	  $('<i class="fa fa-star-o '+(classes || "")+'"></i>').appendTo(div);
    		
    	  $('<span class="text-info label label-default">Rating</span>').appendTo(div);
    	    
    	if(stored) {
    	  index = ratings.indexOf(stored);
    	  for(i = 0; i <= index; i++)
          $('.fa',div).eq(i).addClass('fa-star').removeClass('fa-star-o');
    	      
    	  $('span',div).addClass('label-success').text(ratings[index]);
    	  data[index] = ratings[index];
    	  div.data('rates',data[index]);
    	}
    	    
    	$('.fa', div).css('cursor', 'pointer');
    	
    	$('.fa', div).muOnClick(function() {
    	  index = $(this).index();
    		$('.fa', div).removeClass('fa-star').addClass('fa-star-o');
    		    
    		for(i = 0; i <= index; i++)
    		  $('.fa', div).eq(i).addClass('fa-star').removeClass('fa-star-o');
    		    
    		$('span',div).addClass('label-success').text(ratings[index]);
    		data[index] = ratings[index];
    		div.data('rates',data[index]);
    	});
    	
    	$('.fa', div).hover(
    	    function() {
    	      index = $(this).index();
    	      div.attr('title', ratings[index]);
    	    },
    	    
    	    function() {
    	      div.attr('title', "")
    	    }
    	  )
    	
    	if ($parent) div.appendTo($parent);
    	return div;
    } 
    
    /*
     * use our class that overrides standard checkbox
     */
    checkbox (classes, $parent, text, state, id) {
    	
      // need a unique id, in case same parent has multiple of these
      if ((id === undefined) || (id == ''))
    	  id = (new Date()).getTime().toString();
    	
      var checkbox = $('<div class="mu-square-check '+(classes || "")+'"></div>')
                        .append('<input type="checkbox" value="None" id="' + id + '" /><label for="'+ id +'"></label>');
      
      this.span("small", checkbox, text);

      state && checkbox.find('input').prop('checked', state);
      if ($parent) checkbox.appendTo($parent);
      return checkbox;
      
    } 
    
    dropdown  (classes, $parent, name, values) {
    	var dropdown = $('<select class="form-control '+(classes || "")+'" name="'+name+'"></select>'),
    		length = values.length;
    	for(var i = 0; i < length; i++)
    		$('<option value="'+values[i]+'">'+values[i]+'</option>').appendTo(dropdown);
    	if ($parent) dropdown.appendTo($parent);
        return dropdown;
    } 
    

    inpGrp (classes, $parent, ph, leftCls, rightCls) {
      
      var div = basic('div', 'input-group ' + classes, $parent);
      if (leftCls !== undefined) $('<span class="input-group-addon ' + (leftCls || '') +'"></span>').appendTo(div);
      var inp = $('<input type="text" class="form-control" placeholder="'+ (ph || "") +'">').appendTo(div);
      if (rightCls !== undefined) $('<span class="input-group-addon ' + (rightCls || '') +'"></span>').appendTo(div);
      
      return inp;
    } 
    
    carouselIndicators (classes, $parent, number) {
    	var ol = basic('ol', "carousel-indicators " + classes, $parent, null),
    		i = 0;
    	for( i; i < number; i++) {
    		$('<li class="'+ (i === 0 ? "active" : "") +'"></li>').appendTo(ol);
    	}
    	return ol;
    }
    
    ul_list (classes, $parent, items) {
    	var ul = basic('ul', "" + classes, $parent, null),
        item, index = 0;
    	while (item = items[index++]) {
      	$('<li >' + item + '</li>').appendTo(ul);
    	}
    	return ul;
    } 
    
    options (classes, $parent, items) {
      var ul = basic('ul', "" + classes, $parent, null),
        item, index = 0;
      while (item = items[index++]) {
        $('<li >' + item + '</li>').appendTo(ul);
      }
      return ul;
    }
      
    list (classes, $parent, itemclasses, items) {
        
        var div = basic('div', 'list-group ' + (classes || ''), $parent);
        
        if (itemclasses !== undefined) {
          for ( var i = 0; i < items.length; i++) {
            $('<a href="#" class="list-group-item ' + (itemclasses || '') + '">' + items[i] + '</a>').appendTo(div);
          }
        }
        
        return div;
     }
    
     progressBar (classes, $parent, pclasses, width) {
       
    	 var div = ui.div('progress ' + classes, $parent),
    	     child = ui.div('progress-bar ' + (pclasses || ""), div);
    	 
    	 child.css('width', width || 0).attr('role', 'progressbar')
    	 return div;
     } 

     table  (classes, $parent, headers) {
       var table = basic('table','table '+ classes, $parent, null)
       
       if(headers && headers.length) {
         var tr = $('<tr></tr>').appendTo(table)
         headers.forEach(function(th) {
           $('<th></th>').html(th).appendTo(tr)
         })
       }
       
       return table
     } 

     gridClass (classes, arSize, arOffset) {
    	 var gridClass =classes + " ";
    	 function docls(ar, pre) {
    	        var o = {l:0, m:0, s:0, x:0}, len = ar.length, strCls = "";
    	        switch (len) {
    	          case 1: o = {l:ar[0], m:ar[0], s:ar[0], x:ar[0]}; break;
    	          case 2: o = {l:ar[0], m:ar[0], s:ar[1], x:ar[1]}; break;
    	          case 3: o = {l:ar[0], m:ar[1], s:ar[2], x:ar[2]}; break;
    	          case 4: o = {l:ar[0], m:ar[1], s:ar[2], x:ar[3]}; break;
    	        }
    	        
    	        if (o.l !== "") strCls += " col-lg-" + pre + o.l;
    	        if (o.m !== "") strCls += " col-md-" + pre + o.m;
    	        if (o.s !== "") strCls += " col-sm-" + pre + o.s;
    	        if (o.x !== "") strCls += " col-xs-" + pre + o.x;
    	 
    	        return strCls;
              } 
    	 if(arSize) gridClass += docls(arSize,'');
    	 if(arOffset) gridClass += docls(arOffset,'offset-');
    	 
    	 return gridClass;
    	 
     } 
     
     span (classes, $parent, text) {
    	 
    	 var span = basic('span', classes, $parent, text);
         return span;
         
     } 
     
     i (classes, $parent) {
       
       var i = basic('i', classes, $parent);
         return i;
         
     } 
     
     img (classes, $parent, src) {
    	 var img = $('<img src="'+src+'" class="'+classes+'"/>');
    	 if($parent) img.appendTo($parent);
     	 return img;
     } 
     
     multimedia  (src, $parent, vid) {
       
       var el     = vid ? $('<video controls></video>') : $('<audio controls></audio>'),
           elType = vid ? 'video' : 'audio';
       $('<source src="'+src+'" type="'+elType+'/mp4">').appendTo(el)
       $('<source src='+src+' type="'+elType+'/ogg">').appendTo(el)
       if($parent) el.appendTo($parent)
       return el
       
     }
     
     canvas (classes, $parent) {
       var canvas = $('<canvas class="'+classes+'"></canvas>')
       if($parent) canvas.appendTo($parent)
       return canvas;
       
     }
     
     objFormat (classes, parent, obj) {
       
      var pre  =   basic('pre', '', parent, JSON.stringify(obj, null, 4))
      pre.css({
        'color':'black',
        'background-color':'white'
      })
     } 
     
     /*
      * common utility functions
      */
     
     getCongruentArray (len, item) {
       
       var ar = []
       
       for(var i=0; i<len; i++) {
         ar.push(item)
       }
       
       return ar
     } 
     
     
     arrayToCSV (data, sep) {
       var ar = data.slice(0)
       
       ar.forEach( function(item, i) {
         ar[i] = item.join(sep)
       })
       
       return ar.join('\n')
       
     } 
     
     CSVToArray (csv, sep) {
       var ar 
       
       ar = csv.split('\n')
       ar.forEach( function(str, i) {
         ar[i] = str.split(sep)
       })
       
       return ar
     }
          
     /*-----------------------------------------------------------
      * Functions for elements
      * -----------------------------------------------------------
      */
        
     onlyNumbers  ($elem) {
       $elem.on('keypress', function(e) {
         var k = e.which;
         if(k < 48 || k > 58) 
             e.preventDefault(); 
       })
     } 
     
     checkBlanks (elems, msgCode) {
       
       var error = false,
           that  = this;
       
       elems.forEach( function($el) {
      	 if (!$el.val().trim()) {
           that.setError($el, msgCode);
           error = true;
         }
       })
       /*
       $elems.each(function() {
         var $elem = $(this);
         
         if ($elem.val().trim()) {
           that.setError($elem, msgCode);
           error = true;
         }
       })*/
       return error;
     }
     
     setError ($elem, msgCode, msgParams) {
       
       var $parent = $elem.parent('div');
       
       $parent.addClass('has-error');
       $elem.addClass('has-error');
       $parent.find('span').length ||
         this.span('small text-danger error-span', $parent, app.xlate(msgCode))
     } 
     
     checkNumber  (elems, msgCode) {
       
       var error = false,
           that  = this,
           num;
       
       
       elems.forEach(function($el) {
      	  num = Number($el.val().trim());
          if (isNaN(num) || num === 0) {
            that.setError($el, msgCode);
            error = true;
          }
	     })
       /*
       $elems.each(function() {
         var $elem = $(this);
         num = Number($elem.val().trim());
         if (isNaN(num) || num === 0) {
           that.setError($elem, msgCode);
           error = true;
         }
       })*/
       return error;
     } 

     resetOnInput  (elems) {
       
    	 
    	 elems.forEach(function($el) {
    		 $el.on('input', function() {
    		    var $elem = $(this),
                $parent = $(this).parent('div');
         
            if ($elem.val().trim()) {
               $parent.removeClass('has-error').find('span.error-span').remove();
               $elem.removeClass('has-error');
            }
    		 })
    	 })     	
     } 
     
     getPoster (video) {
       
       var canvas, ctx_draw, img, binStr, parts, buf, view, blob;
       
       video = video.get(0)
       canvas = $('<canvas></canvas>').get(0)    
       canvas.width = video.offsetWidth;
       canvas.height = video.offsetHeight;
       
       ctx_draw = canvas.getContext('2d');
       ctx_draw.drawImage(video, 0, 0, canvas.width, canvas.height);
       
       img = $('<img></img>')
       img.src = canvas.toDataURL('image/jpeg', .6);
       
       parts = img.src.match(/data:([^;]*)(;base64)?,([0-9A-Za-z\+]+)/);
       binStr = atob(parts[3]);
       buf = new ArrayBuffer(binStr.length);
       view = new Uint8Array(buf);
       for(var i = 0; i < view.length; i++) {
         view[i] = binStr.charCodeAt(i);
       }
       
       blob = new Blob([view], {'type': parts[1]})
       
       return {img: img, blob:blob}
     } 
     
     collapse (classes, parent, titles, data) {
       var count = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'],
           rows  = []
       
       for (var j = 0; j < titles.length; j++) {
         var string = '',
             type   = titles[j].type
         for (var k = 0; k < data[j].length; k++) {
           string += '<label class="' + type + ' small"><input type="' + type +
           '" name="'+ titles[j].header +'" value="'+
           data[j][k]+'">'+data[j][k]+'</label>'
         }
         rows.push(string)
       }
       
       for (var i = 0; i < titles.length; i++) {
         $('<div class="panel-group" id="accordion">' +
         '<div class="panel panel-default">' +
           '<div class="panel-heading">' + 
             '<h4 class="panel-title">' +
              ' <a data-toggle="collapse" data-parent="#accordion" href="#collapse' +
              count[i] +'">' +titles[i].header +
               '</a>' +
            ' </h4>' +
           '</div>' +
           '<div id="collapse' + count[i] + '" class="panel-collapse collapse">' +
             '<div class="panel-body' + classes + '">' +
             rows[i] +
            ' </div>' +
           '</div>' +
         '</div>').appendTo(parent)
       }
     }
     
    //  /*jshint ignore:end*/  
    // 

  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = new UI();
  } else if (typeof window !== 'undefined') {
    window.ui = new UI();
  }

})(); // overall

