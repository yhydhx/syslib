
//
// NS:CORE
// REQUIRE:NONE
// NEED:NONE
//
SYSLIB={
	ver:0,
	 //settings
    settings:{
    	release:0,
    	loglevel:0,
    	set:function(settings){
    		for(var key in settings[key]){
    			SYSLIB.settings[key]=settings[key];
    		}
    	}
    },

	//namespace system
	namespaces:{},
	namespaces_list:{},
	namespaces_checklock:0,
	namespaces_requireEnd:[],
	namespaces_checkend:function(){
		if(SYSLIB.namespaces_checklock){
	      	clearTimeout(SYSLIB.namespaces_checklock);
	    }
	    SYSLIB.namespaces_checklock=setTimeout(function(){
	    	__Error.log(0,"Namespace : all NS loaded");
	    	for(var i in SYSLIB.namespaces_list){
	    		if(SYSLIB.namespaces_list[i]!=1){
					__Error.log(2,"Namespace : can't find required ns "+i)
					return;
				}
	    	}
	    	for(var i=0;i<SYSLIB.namespaces_requireEnd.length;i++){
	    		SYSLIB.namespaces_requireEnd[i]();
	    	}
	    	if(window.nsloaded){
	    		window.nsloaded();
	    	}
	    },50);
	},
	namespace:function (nsname,require,requireEnd) {
		var ns = nsname.split("."),
			opns = SYSLIB.namespaces[ns[0]],
			i = 1;
		SYSLIB.namespaces_list[nsname]=1;
		if(requireEnd){
			SYSLIB.namespaces_requireEnd.push(requireEnd)
		}
		if(require&&require!=-1){
			if(typeof(require)!='object'){
				var tmprequire=[];
				tmprequire[0]=require;
				require=tmprequire;
			}
			for(i=0;i<require.length;i++){
				if(!SYSLIB.namespaces_list[require[i]]){
					SYSLIB.namespaces_list[require[i]]=-1;
				}
			}
			SYSLIB.namespaces_checkend();
		}
		if(typeof(opns) != 'function'){
				SYSLIB.namespaces[ns[0]] = function () {};
				opns = SYSLIB.namespaces[ns[0]];
		}
		for(i = 1;i<ns.length;i++) {
		  if(typeof(opns[ns[i]]) !=  'function') {
		  		if(require!=-1){
				    opns[ns[i]] = function () {};
		  		}else{
		  			return 0;
		  		}
		  }
		  opns = opns[ns[i]];
		}
		return opns;
	},
	//include & exclude
	included:{},
	includePath:'',
	include_need:0,
	include_end_callback:0,
	include_checklock:0,
	check_loadend:function(){
	    if(SYSLIB.include_checklock){
	      clearTimeout(SYSLIB.include_checklock);
	    }
	    SYSLIB.include_checklock=setTimeout(function(){
	    	__Error.log(0,"INCLUDE : all file loaded");
	        if(!SYSLIB.include_need&&$this.include_end_callback){
	          SYSLIB.include_end_callback();
	          SYSLIB.include_end_callback=0;
	        }
	    },500);
	},
	include:function (file,callback) {
		var files  =  typeof file  ==  "string" ? [file]:file,
			i  =  0;
		if(callback){
	        SYSLIB.include_end_callback=callback;
	    }
		for (i  =  0; i < files.length; i++) {
			var ttp = files[i].split("#");
			if(ttp[1] == "!") {
				//If use name#! the file will be loaded again
				SYSLIB.included[SYSLIB.includePath+ttp[0]] = 0;
			}
		  		//check if already included.
		    if(!SYSLIB.included[SYSLIB.includePath+ttp[0]]) {
				var name  =  ttp[0].replace(/^\s|\s$/g, ""),
					att  =  name.split('.'),
					ext  =  att[att.length - 1].toLowerCase(),
					isCSS  =  ext  ==  "css",
					tag  =  isCSS ? "link" : "script",
					newnode = document.createElement(tag),
					link  =  SYSLIB.includePath + name;
				if(isCSS) {
					newnode.setAttribute("rel","stylesheet");
					newnode.setAttribute("href",link);
				}else{
					newnode.setAttribute("src",link);
				}
				$newnode.includeLink=$newnode
				__Error.log(0,"INCLUDE : including "+$newnode);
				document.body.appendChild(newnode);
				$newnode.onload=function(){
					__Error.log(0,"INCLUDE : included "+this.includeLink);
			        SYSLIB.include_need--;
			        SYSLIB.check_loadend();
			    }
				SYSLIB.included[SYSLIB.includePath+ttp[0]] = 1;
		    }
	    }
	},
	exclude:function(filename, filetype) {
		__Error.log(0,"EXCLUDE : excluded "+filetype+": "+filename);
	    var targetelement = (filetype == "js")? "script" : (filetype == "css")? "link" : "none", //determine element type to create nodelist from
	        targetattr = (filetype == "js")? "src" : (filetype == "css")? "href" : "none", //determine corresponding attribute to test for
	        allsuspects = document.getElementsByTagName(targetelement),
	        i = allsuspects.length;
	    for (i = allsuspects.length; i>= 0; i--) { //search backwards within nodelist for matching elements to remove
	        if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!= null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!= -1){
	            allsuspects[i].parentNode.removeChild(allsuspects[i]) //remove element by calling parentNode.removeChild()
	        }
	    }
    },
    //baseurl
    baseurl:window.location.protocol+"//"+window.location.hostname
}

//
//syslib.error
//

var __Error=SYSLIB.namespace("syslib.error");
__Error.List=[];
//level
// 0 all 1 warn & error 2 error only
__Error.log=function(type,text){  // type = Notice Warn Error
	var log={
		type:type,
		text:type
	}
	if(!SYSLIB.settings['loglevel']||SYSLIB.settings['loglevel']<type){
		return console.log("%c"+(["Notice: ","Warn: ","Error: "])[type],(["color:#5353E5","color:#F7620E","color:#F81325"])[type]),console.log("%c"+text,(["background:#AED8FA","background:#FCCEB4","background:#F199A0"])[type]);
	}
}
window.onerror  =  function(errorMessage, errorUrl, errorLine){
	__Error.log(2,errorMessage+" onLine :"+((errorLine)?errorLine:"unknow Of ")+((errorUrl)?errorUrl:"unknow File"));
	return (SYSLIB.settings['release'])?true:false;
}


//
// NS:MATH
// REQUIRE:CORE
// NEED:NONE
//
var __Math=SYSLIB.namespace("syslib.math");
__Math.has =  function ($a,$b) {
            var $has = 0;
      $a = ($a.length)?$a:[$a];
      $b = ($b.length)?$b:[$b];
      for(var $j = 0;$j<$a.length;$j++) {
        for(var $k = 0;$k<$b.length;$k++) {
          if($a[$j] == $b[$k]) {
            $has++;
          }
        }
      }
            return ($has>= $b.length)
};
__Math.rand =  function (min,max,length) {
    var $rand = min+(Math.random() * (max-min));
    if(length) {
      if(length>0) {
        $rand = ($rand.toString()).split(".");
        $rand[1] = $rand[1].substr(0,length);
        $rand = $rand.join(".");
        return parseFloat($rand);
      }else{
        return $rand;
      }
    }else{
            return Math.floor($rand);
    }
};


//
// NS:DOM
// REQUIRE:CORE,MATH
// NEED:EVENT[ Bind event to dom obj ],UTIL[ dom obj global position ]
//
__Dom = SYSLIB.namespace("syslib.dom","syslib.math");
__Dom.domcache = {
	allnodes:[],
	byid:{},
	byclass:{},
	bytag:{},
	byattr:{}
};
__Dom.fresh=function () {
	__Dom.domcache = {
	    allnodes:[],
	    byid:{},
	    byclass:{},
	    bytag:{},
	    byattr:{}
	}
    __Dom.findall(document.body);
    __Error.log(0,"DOM : fresh cache.");
}
__Dom.nodeparser=function(node){
	node.find=function(ipt){
		return __Dom.find(ipt,this);
	}
	node.search=function(ipt){
		return __Dom.search(ipt,this);
	}
	node.searchcontent=function(ipt){
		return __Dom.searchcontent(ipt,this);
	}
	node.has=function(ipt){
		return __Dom.class(this).has(ipt);
	}
	node.class=function(){
		return __Dom.class(this).get();
	}
	node.add=function(ipt){
		return __Dom.class(this).add(ipt);
	}
	node.remove=function(ipt){
		return __Dom.class(this).remove(ipt);
	}
	node.replace=function(ipt,to){
		return __Dom.class(this).replace(ipt,to);
	}
  node.getAttr=function(attrnames){
    if(typeof(attrnames)!='object'){
      return this.getAttribute(attrnames);
    }else{
      var attrs=[];
      for(var i=0;i<attrnames.length;i++){
        attrs.push(this.getAttribute(attrnames[i]))
      }
      return attrs;
    }
  }
  node.setAttr=function(attrsets,val){
    if(typeof(attrsets)!='object'){
      if(typeof(val)!='undefined'){
        this.setAttribute(attrsets,val);
      }else{
        __Error.log(2,"Node : can't set attribute missing value!");
      }
    }else{
      if(attrsets.length){
        if(typeof(val)!='undefined'){
          if(typeof(val)!='object'){
            for(var i=0;i<attrsets.length;i++){
              this.setAttribute(attrsets[i],val);
            }
          }else{
            if(val.length){
              if(val.length>=attrsets.length){
                this.setAttribute(attrsets[i],val[i]);
              }else{
                __Error.log(2,"Node : can't set attribute when key's length > value's length!");
              }
            }else{
              __Error.log(2,"Node : can't set attribute invilade value!");
            }
          } 
        }else{
          __Error.log(2,"Node : can't set attribute missing value!");
        }
      }else{
        for(var i in attrsets){
          this.setAttribute(i,attrsets[i]);
        }
      }
    }
  }
  if(__Event){
      node.addListener=function(event,listener,nopopup,level){
        return __Event.Listen(event,listener,nopopup,level,this);
      }
      node.removeListener=function(event,listener,nopopup,level){
        return __Event.unListen(event,listener,nopopup,level,this);
      }
      node.clearListener=function(){
        return __Event.clear(this);
      }
  }
  if(__Util){
      node.globalposition=function(event,listener,nopopup,level){
        return __Util.globalposition(this);
      }
  }
	return node;
}
__Dom.findall = function (father) {
    if(father.tagName) {
    	var list = father.childNodes;
    	__Dom.domcache.allnodes.push(__Dom.nodeparser(father));
    	if(list) {
        	if(list.length>0) {
        		var i = 0;
        		for(i = 0;i<list.length;i++) {
          			__Dom.findall(list[i]);
        		}
      		}else{
        		__Dom.findall(list);
      		}
    	}
  	}
}
__Dom.find = function (ipt,from) {
  	this.findthis = function (ipt,from) {
    	var $query = ipt.split("#"),
    		$nodes = 0;
    	if($query[1]) {
      		if(!from) {
        		$nodes = (__Dom.domcache.byid[$query[1]])?__Dom.domcache.byid[$query[1]]:document.getElementById($query[1]);
        		$nodes = ($nodes)?$nodes:0;
        		if($nodes) {
        			$nodes=__Dom.nodeparser($nodes);
          			__Dom.domcache.byid[$query[1]] = $nodes;
        		}
        		return $nodes;
      		}else{
        		var $nodesn = [],$uu = 0;
        		for($uu = 0;$uu<from.length;$uu++) {
         			$nodes = from[$uu];
          			if($nodes.id&&$nodes.id == $query[1]) {
          				if($nodes){
          					$nodes=__Dom.nodeparser($nodes);
          				}
            			$nodesn.push($nodes);
          			}
        		}
        		return $nodesn;
      		}
    	}
    	$query = ipt.split(".");
    	if($query[1]) {
      		if(!from) {
       			$nodes = (__Dom.domcache.byclass[$query[1]])?__Dom.domcache.byclass[$query[1]]:document.getElementsByClassName($query[1]);
        		$nodes = ($nodes)?$nodes:0;
        		if($nodes) {
        			$nodes=__Dom.nodeparser($nodes);
          			__Dom.domcache.byclass[$query[1]] = $nodes;
        		}
        		return $nodes;
      		}else{
        		var $nodesn = [],$uu = 0;
        		for($uu = 0;$uu<from.length;$uu++) {
         			$nodes = from[$uu];
          			if($nodes.className&&$nodes.className == $query[1]) {
          				if($nodes){
          					$nodes=__Dom.nodeparser($nodes);
          				}
            			$nodesn.push($nodes);
          			}
        		}
        		return $nodesn;
      		}
    	}
    	$query = ipt.split("<");
    	if($query[1]) {
      		$query = $query[1].split(">");
      		if(!from) {
       			$nodes = (__Dom.domcache.bytag[$query[0]])?__Dom.domcache.bytag[$query[0]]:document.getElementsByTagName($query[0]);
        		$nodes = ($nodes)?$nodes:0;
        		if($nodes) {
        			$nodes=__Dom.nodeparser($nodes);
          			__Dom.domcache.bytag[$query[0]] = $nodes;
        		}
        		return $nodes;
      		}else{
        		var $nodesn = [],$uu = 0;
        		for($uu = 0;$uu<from.length;$uu++) {
          			$nodes = from[$uu];
          			if($nodes.tagName&&(($nodes.tagName).toUpperCase()) == (($query[0]).toUpperCase())) {
            			$nodesn.push($nodes);
          			}
        		}
        		return $nodesn;
      		}
    	}
    	$query = ipt.split(" = ");
    	if($query[1]) {
      		$query[1] = $query[1].split("]")[0];
      		$query[0] = $query[0].split("[")[1];
      		if(!from) {
        		if(__Dom.domcache.byattr[$query[0]]) {
          			$nodes = __Dom.domcache.byattr[$query[0]];
        		}else{
          			if(!__Dom.domcache.allnodes||__Dom.domcache.allnodes.length == 0) {
            			__Dom.freshdomcache();
          			}
	          		for(var $k = 0;$k<__Dom.domcache.allnodes.length;$k++) {
	            		var $yy = __Dom.domcache.allnodes[$k];
	            		if($yy.getAttribute($query[0])&&$yy.getAttribute($query[0]) == $query[1]) {
	              			if(!$nodes) {
	                			$nodes = [];
	              			}
	              			if($yy){
	          					$yy=__Dom.nodeparser($yy);
	          				}
	              			$nodes.push($yy);
	            		}
	          		}
        		}
	        	$nodes = ($nodes)?$nodes:0;
	        	if($nodes) {
	          		__Dom.domcache.byattr[$query[0]] = $nodes;
	        	}
	        	return $nodes;
	      	}else{
	        	var $nodesn = [],$uu = 0;
	        	for($uu = 0;$uu<from.length;$uu++) {
	          		$nodes = from[$uu];
	          		if($nodes.getAttribute&&$nodes.getAttribute($query[0])&&$nodes.getAttribute($query[0]) == ($query[1])) {
	          			if($nodes){
          					$nodes=__Dom.nodeparser($nodes);
          				}
	            		$nodesn.push($nodes);
	          		}
	        	}
	        	return $nodesn;
	      	}
    	}
	}
  	//##########################
  	//U:$dom = __Dom.find("bellow");
  	//#id or .class or <tag> or [attr = val] mutil arg must use &&.
  	//E.G. "<div>&&.ffg&&[type = ll]"
  	//Do not support RE FOR NOW !
  	//R:dom node(s) or 0;
  	//##########################
  	var $i = 0,$j = 0;
  	if(!from) {
    	var $k = 0;
  	}else{
  		if(from.tagName){
  			var $k = __Dom.findall(from);
  		}else{
  			var $k = from;
  		}
  	}
  	__Error.log(0,"DOM : find "+ipt);
  	if(ipt.indexOf("&&")>0) {
    	$j = ipt.split("&&");
    	for($i = 0;$i<$j.length;$i++) {
      		$k = this.findthis($j[$i],$k);
      		if(!$k) {
        		return 0;
      		}
    	}
    	return $k;
  	}else{
    	return this.findthis(ipt,$k);
  	}
}
__Dom.search = function (ipt,from) {
  	this.searchthis = function (ipt,from) {
    	var $query = ipt.split("#"),$nodes = 0;
    	if(!from) {
      		var from = __Dom.domcache.allnodes;  
    	}
    	if($query[1]) {
      		var $nodesn = [],$uu = 0;
      		for($uu = 0;$uu<from.length;$uu++) {
        		$nodes = from[$uu];
        		if($nodes.id&&($nodes.id).match($query[1])) {
        			if($nodes){
          				$nodes=__Dom.nodeparser($nodes);
          			}
          			$nodesn.push($nodes);
        		}
      		}
      		return $nodesn;
    	}
    	$query = ipt.split(".");
		if($query[1]) {
  			var $nodesn = [],$uu = 0;
  			for($uu = 0;$uu<from.length;$uu++) {
    			$nodes = from[$uu];
    				if($nodes.className&&($nodes.className).match($query[1])) {
    					if($nodes){
          					$nodes=__Dom.nodeparser($nodes);
          				}
      					$nodesn.push($nodes);
    				}
  				}
  			return $nodesn;
		}
		$query = ipt.split("<");
    	if($query[1]) {
      		$query = $query[1].split(">");
      		var $nodesn = [],$uu = 0;
      		for($uu = 0;$uu<from.length;$uu++) {
        		$nodes = from[$uu];
        		if($nodes.tagName&&(($nodes.tagName).toUpperCase()).match($query[0])) {
        			if($nodes){
          				$nodes=__Dom.nodeparser($nodes);
          			}
          			$nodesn.push($nodes);
        		}
      		}
      		return $nodesn;
    	}
    	$query = ipt.split(" = ");
    	if($query[1]) {
      		$query[1] = $query[1].split("]")[0];
      		$query[0] = $query[0].split("[")[1];
      		var $nodesn = [],$uu = 0;
      		for($uu = 0;$uu<from.length;$uu++) {
        		$nodes = from[$uu];
        		if($nodes.getAttribute&&$nodes.getAttribute($query[0])&&($nodes.getAttribute($query[0])).match($query[1])) {
        			if($nodes){
          				$nodes=__Dom.nodeparser($nodes);
          			}
          			$nodesn.push($nodes);
        		}
      		}
      		return $nodesn;
    	}
  	}
  	//##########################
  	//U:$dom = __Dom.search("bellow");
  	//#id or .class or <tag> or [attr = val] mutil arg must use &&.
  	//id / class / tag / val is in RE
  	//Only support RE FOR NOW !
  	//R:dom node(s) or 0;
  	//##########################
  	var $i = 0,$j = 0;
  	if(!from) {
    	var $k = 0;
    	if(!__Dom.domcache.allnodes||__Domcache.allnodes.length == 0) {
      		__Dom.freshdomcache();
    	}
  	}else{
    	if(from.tagName){
  			var $k = __Dom.findall(from);
  		}else{
  			var $k = from;
  		}
  	}
  	__Error.log(0,"DOM : search "+ipt);
  	if(ipt.indexOf("&&")>0) {
    	$j = ipt.split("&&");
    	for($i = 0;$i<$j.length;$i++) {
      		$k = this.searchthis($j[$i],$k);
      		if(!$k) {
        		return 0;
      		}
    	}
    	return $k;
  	}else{
    	return this.searchthis(ipt,$k);
  	}
}
__Dom.searchcontent = function (ipt,from) {
  	if(!from) {
      	if(!__Dom.domcache.allnodes||__Dom.domcache.allnodes.length == 0) {
        	__Dom.freshdomcache();
      	}
      	var from = __Dom.domcache.allnodes;  
  	}
  	var $nodesn = [],$uu = 0;
  	for($uu = 0;$uu<from.length;$uu++) {
    	$nodes = from[$uu];
    	if($nodes.innerHTML&&($nodes.innerHTML).match(ipt)) {
    		if($nodes){
          		$nodes=__Dom.nodeparser($nodes);
          	}
      		$nodesn.push($nodes);
    	}
  	}
  	__Error.log(0,"DOM : searchcontent "+ipt);
  	return $nodesn;
}
__Dom.class = function (domnodes) {
  	if(!domnodes) {
      	return;
  	}
  	var $this = {};
  	$this.domnode = domnodes;
  	if(!$this.domnode.length) {
    	$this.domnode = [$this.domnode];
  	}
  	$this.has = function (ipt) {
    	var $hasclass = true,
	        ipt = ipt.split(" "),
	        $i = 0;
    	for($i = 0;$i<$this.domnode.length;$i++) {
	      	var domnode = $this.domnode[$i],
	          	$thisclassName = (domnode.className)?((domnode.className).split(" ")):[];
	      	if(!__Math.has($thisclassName,ipt)) {
	        	$hasclass = false;
	      	}
    	}
    	return $hasclass;
  	}
  	$this.get = function (ipt) {
    	var $nodesclasslist = [],
        	$i = 0;
    	for($i = 0;$i<$this.domnode.length;$i++) {
      		var domnode = $this.domnode[$i],
          	$thisclassName = (domnode.className)?((domnode.className).split(" ")):"",
         	$j = 0;
      		for($j = 0;$j<$thisclassName.length;$j++) {
        		if($nodesclasslist.indexOf($thisclassName[$j])<0) {
          			if($thisclassName[$j]!= "") {
            			$nodesclasslist.push($thisclassName[$j]);
          			}
        		}
      		}
    	}
    	return $nodesclasslist;
  	}
  	$this.add = function (ipt) {
    	var ipt = ipt.split(" "),
        	$i = 0;
    	for($i = 0;$i<$this.domnode.length;$i++) {
      		var domnode = $this.domnode[$i],
          		$thisclassName = (domnode.className)?((domnode.className).split(" ")):[],
          		$thisclassName = ($thisclassName!= "")?$thisclassName:[],
          		$j = 0;
      		for($j = 0;$j<ipt.length;$j++) {
        		if(!__Math.has($thisclassName,[ipt[$j]])) {
          			if($thisclassName.length) {
            			$thisclassName.push(ipt[$j]);
          			}else{
           				$thisclassName = [ipt[$j]];
          			}
        		}
      		}
      		domnode.className = $thisclassName.join(" ");
    	}
  	}
  	$this.remove = function (ipt) {
    	var ipt = ipt.split(" "),$i = 0;
    	for($i = 0;$i<$this.domnode.length;$i++) {
      		var domnode = $this.domnode[$i],
          		$thisclassName = (domnode.className).split(" ")||"",
          		$j = 0;
      		for($j = 0;$j<ipt.length&&$thisclassName;$j++) {
        		if(__Math.has($thisclassName,[ipt[$j]])) {
          			$thisclassName.splice($thisclassName.indexOf(ipt[$j]),1);
        		}
      		}
      		domnode.className = $thisclassName.join(" ");
    	}
  	}
  	$this.replace = function (ipt,to) {
    	var ipt = ipt.split(" "),
        	to = to.split(" "),
        	$i = 0;
    	for($i = 0;$i<$this.domnode.length;$i++) {
      		var domnode = $this.domnode[$i],
          	$thisclassName = (domnode.className).split(" ");
          	$thisclassName = ($thisclassName!= "")?$thisclassName:[];
      		if($thisclassName!= []) {
        		var $hasipt = 1,
            	$j = 0;
	        	for( $j = 0;$j<ipt.length;$j++) {
	          		if(!__Math.has($thisclassName,[ipt[$j]])) {
	            		$hasipt = 0;
	          		}
	        	}
	        	if($hasipt) {
	          		for($j = 0;$j<ipt.length;$j++) {
	            		if($thisclassName.indexOf(ipt[$j])>= 0) {
	              			$thisclassName.splice($thisclassName.indexOf(ipt[$j]),1);
	            		}
	          		}
	          		for($j = 0;$j<to.length;$j++) {
	            		if($thisclassName.indexOf(to[$j])<0) {
	              			if($thisclassName.length) {
	                			$thisclassName.push(to[$j]);
	              			}else{
	                			$thisclassName = [to[$j]];
	              			}
	            		}
	          		}
	          		domnode.className = $thisclassName.join(" ");
	        	}
      		}
   	 	}
  	}
  	return $this;
}

//short cuts

var _f=SYSLIB.namespace("syslib.dom").find,
	_search=SYSLIB.namespace("syslib.dom").search,
	_c=SYSLIB.namespace("syslib.dom").class;



//
// NS:EVENT
// REQUIRE:CORE,UTIL
// NEED:NONE
//

var HEIGHTEST=0,
  LOWEST=Math.pow(2, 53);

var __Event=SYSLIB.namespace("syslib.event","syslib.util",function(){
	__Event.global.eventtoken="global";
});
////////////////////////////////
// There is a level define listener's
// order with same event.
//
// use HEIGHTEST for the one you want 
// to triger it very first
// use LOWEST for the one you want
// to triger it very last
//
// trigger order is from HEIGHTEST(0) to LOWEST(Max val)
////////////////////////////////
__Event.Listeners={};
__Event.global={};
__Event.Listen=function(event,listener,nopopup,level,element){
	if(!element){
		element=__Event.global;
	}
	if(!element.eventtoken){
		element.eventtoken=__Util.token();
		if(element!=__Event.global){
			element.setAttribute("eventtoken",element.eventtoken)
		}
	}
	if(!__Event.Listeners[element.eventtoken]){
		__Event.Listeners[element.eventtoken]=new Object();
	}
	if(!__Event.Listeners[element.eventtoken][event]){
		__Event.Listeners[element.eventtoken][event]=new Array();
		if(element!=__Event.global){
			if(!Element.prototype.addEventListener){
				element.attachEvent('on'+event,function(){
					__Event.emit(event,window.event,element,this);
				})
			}else{
				element.addEventListener(event,function(e){
					__Event.emit(event,e,element,this);
				},false)
			}
		}
	}
	var elementinfo=(element.id)?("#"+element.id):element.eventtoken;
		listenerList=__Event.Listeners[element.eventtoken][event];
	if(!level){
		listenerList.push({
			listener:listener,
			nopopup:nopopup
		})
		__Error.log(0,"Event : Event "+elementinfo+"."+event+"'s Listener with Level "+listenerList.length+" is added.");
	}else{
		
		if(!listenerList[level]){
			listenerList[level]={
				listener:listener,
				nopopup:nopopup
			}
			if(level==LOWEST){
				__Error.log(0,"Event : Event "+elementinfo+"."+event+"'s Listener with LOWEST level added.");
			}else{
				__Error.log(0,"Event : Event "+elementinfo+"."+event+"'s Listener with Level "+level+" is added.");
			}
		}else{
			if(level==LOWEST){
				__Error.log(2,"Event : Event "+elementinfo+"."+event+"'s Listener with LOWEST Level is used.");
				return;
			}
			var newlevel=level;
			while(listenerList[newlevel]&&newlevel<LOWEST){
				newlevel++;
			}
			if(listenerList[newlevel]){
				__Error.log(2,"Event : Event "+elementinfo+"."+event+"'s Listener with Level "+level+" is used. Tried using lower Level but all is used.");
				return;
			}
			listenerList[newlevel]={
				listener:listener,
				nopopup:nopopup
			}
			if(newlevel==LOWEST){
				__Error.log(1,"Event : Event "+elementinfo+"."+event+"'s Listener with Level "+level+" is used. Using LOWEST level instead.");
			}else{
				__Error.log(1,"Event : Event "+elementinfo+"."+event+"'s Listener with Level "+level+" is used. Using "+newlevel+" level instead.")
			}
		}
		
	}
}
__Event.unListen=function(event,listener,nopopup,level,element,all){
	if(!element){
		element=__Event.global;
	}
	if(!element.eventtoken){
		__Error.log(1,"Event : element With no eventtoken!");
		return;
	}
	var elementinfo=(element.id)?("#"+element.id):element.eventtoken;
	if(!__Event.Listeners[element.eventtoken]||!__Event.Listeners[element.eventtoken][event]){
		__Error.log(1,"Event : Event "+elementinfo+"."+event+" has no Listener to unListen !");
		return;
	}
	var list=__Event.Listeners[element.eventtoken][event];
	for(var i=0;i<list.length;i++){
		if(list[i]){
			if(list[i].listener&&list[i].listener==listener&&list[i].nopopup==nopopup){
				__Error.log(0,"Event : Event "+elementinfo+"."+event+"'s Listener with Level "+i+" is removed.");
				list.splice(i,1);
				if(!all){
					break;
				}
			}
		}
	}
}
SYSLIB.settings.set('event_safe',true);
__Event.clear=function(element){
	if(!element){
		element=__Event.global;
	}
	if(element==__Event.global&&SYSLIB.settings.event_safe){
		__Error.log(1,"Event : can't clear global settings! Please set event_safe to false.");
		return;
	}
	if(!element.eventtoken){
		__Error.log(1,"Event : element With no eventtoken!");
		return;
	}
	var elementinfo=(element.id)?("#"+element.id):element.eventtoken;
	if(!__Event.Listeners[element.eventtoken]){
		__Error.log(1,"Event : Event "+elementinfo+"."+event+" has no Listener to clear !");
		return;
	}
	__Event.Listeners[element.eventtoken]=[];
	__Error.log(0,"Event : Event "+elementinfo+"'s Listener is cleared.");
}
__Event.emit=function(event,data,element,scope){
	if(!element){
		element=__Event.global;
	}
	if(!element.eventtoken){
		__Error.log(1,"Event : element With no eventtoken!");
		return;
	}
	var elementinfo=(element.id)?("#"+element.id):element.eventtoken;
	if(!__Event.Listeners[element.eventtoken]||!__Event.Listeners[element.eventtoken][event]||!__Event.Listeners[element.eventtoken][event].length){
		__Error.log(1,"Event : Event "+elementinfo+"."+event+" has no Listener !");
		return;
	}
	var list=__Event.Listeners[element.eventtoken][event];

	__Error.log(0,"Event : Event "+event+" emit !");
	for(var i=0;i<list.length;i++){
		if(list[i]){
			var nopopup=list[i].nopopup;
			if(list[i].listener){
				__Error.log(0,"Event : Event "+elementinfo+"."+event+" emit Listener with level "+i);
				list[i].listener.call(scope,data);
			}
			if(nopopup){
				__Error.log(0,"Event : Event "+elementinfo+"."+event+" emit break on level "+i);
				break;
			}
		}
	}
}

//short cuts
var _listen=SYSLIB.namespace("syslib.event").Listen,
	_unlisten=SYSLIB.namespace("syslib.event").unListen;




//
// NS:TEMPLATE
// REQUIRE:CORE
// NEED:NONE
//
__Template=SYSLIB.namespace("syslib.template");
//
__Template.SYS_LAN={};
//
//Use this for simple language support
//
__Template.preprocess=[];
__Template.postprocess=[];
__Template.build=function (f,vals,insertTo) {
    //get strings
    var rhtml = f.toString().replace(/^[^\/]+\/\*!?\s?/, '').replace(/\*\/[^\/]+$/, '');

    //parse vals
    rhtml = rhtml.replace(/\%\$([0-9])*\%/g, function (match) {
      	var r = match.replace(/\%/g,'');
      	r = parseInt(r.replace(/\$/g,''));
      	if(r&&vals&&typeof(vals[r-1])!== "undefined") {
        	return vals[r-1];
      	}else{
        	__Error.log(2,"Template : can't find "+r+" in vals . in "+f);
      	}
        return match;
    });
    //parse lans
    rhtml = rhtml.replace(/\%\#([^\%]*)\%/g, function (match) {
  		var r = match.replace(/\%/g,'');
  		r = r.replace(/\#/g,'');
  		if(r&&$__Template.SYS_LAN&&typeof($__Template.SYS_LAN[r])!== "undefined") {
    		return $__Template.SYS_LAN[r];
  		}else{
    		__Error.log(2,"Template : can't find "+r+" in Lan file . in "+f);
  		}
      	return match;
  	});

    //****old***
  	//parse width
	  rhtml = rhtml.replace(/\%\&([^\%]*)\%/g, function (match) {
  		var r = match.replace(/\%/g,'');
  		r = r.replace(/\&/g,'');
    	return ((window.innerWidth/1366)*parseInt(r));
  	});
  	//parse Height
    rhtml = rhtml.replace(/\%\@([^\%]*)\%/g, function (match) {
      	var r = match.replace(/\%/g,'');
      	r = r.replace(/\@/g,'');
        return ((window.innerHeight/682)*parseInt(r));
    });
    //***old***

    if(__Template.preprocess){
      for(var i=0;i<__Template.preprocess.length;i++){
        rhtml=__Template.preprocess[i](rhtml);
      }
    }
    if(insertTo){
      insertTo.innerHTML=rhtml;
      if(__Template.postprocess){
        for(var i=0;i<__Template.postprocess.length;i++){
          __Template.postprocess[i](insertTo);
        }
      }
    }
  	return rhtml;
}
//short cuts
var _template = SYSLIB.namespace("syslib.template").build;
var _lang=function(name){SYSLIB.namespace("syslib.template").SYS_LAN[name];};

//
// NS:UI
// REQUIRE:CORE,TEMPLATE,DOM,EVENT,UTIL
// NEED:NONE
//

//
// Basic UI require ui.css
//


__UI=SYSLIB.namespace("syslib.ui",["syslib.template","syslib.dom","syslib.event","syslib.util"],function(){
  __Template.preprocess.push(__UI.preprocess);
  __Template.postprocess.push(__UI.postprocess);
});
__UI.list={};
SYSLIB.settings.set('ui_overwrite',false);
__UI.add=function(gtype,type,processfunction){
  if(!__UI.list[gtype]){
    __UI.list[gtype]={}
  }
  if(__UI.list[gtype][type]&&!SYSLIB.settings.ui_overwrite){
    __Error.log(1,"UI : can't overwrite existing ui with type "+gtype+"."+type+" ! Please set ui_overwrite to true.");
    return;
  }
  __UI.list[gtype][type]=processfunction;
}
__UI.tmplist=[];
__UI.preprocess=function(html){
  html=html.replace(/<ui:([a-zA-Z0-9\_\-]*)([^>]*)>/g, function (match,gtype,attrs) {
      var id=__Util.token(),
          type=0,
          orgid=0;
      if(attrs){
        var attr=attrs.match(/type=[\'\"]([\s\S]*?)[\'\"]/);
        if(attr){
          type=attr[1];
        }
        attr=attrs.match(/id=[\'\"]([\s\S]*?)[\'\"]/);
        if(attr){
          orgid=attr[1];
        }
      }
      __UI.tmplist.push({
        id:id,
        orgid:orgid,
        gtype:gtype,
        type:(type)?type:'standard'
      })
      return "<div id='"+id+"'"+attrs+">";
  });
  html=html.replace(/<\/ui>/g,"</div>");
  return html;
}
//if not using .insertTo(element) with __Template(f,vals) you must call this manualy
__UI.postprocess=function(element){
  while(__UI.tmplist.length){
    var data=__UI.tmplist.pop();
    var processElement=_f("#"+data.id);
    if(data.orgid){
      processElement.id=data.orgid;
    }
    if(__UI.list[data.gtype]&&__UI.list[data.gtype][data.type]){
      __UI.list[data.gtype][data.type](processElement);
    }else{
       __Error.log(2,"UI : can't process  element:"+data.id+" ! ui type: "+gtype+"."+type+" no found !");
    }
  }
}
__UI.add('btn','standard',function(element){
  element.add("SYSUI_btn_standard");
})
__UI.add('checkbox','standard',function(element){
  element.add("SYSUI_checkbox_standard");
  var checked=element.getAttr("checked");
  checked=(checked&&checked!="false")?true:false;
  var disabled=element.getAttr("disabled");
  disabled=(disabled&&disabled!="false")?true:false;
  element.disabled=disabled;
  element.checked=checked;
  var checks_box=document.createElement('div');
  checks_box.className="checks_box";
  var checks_text=document.createElement('div');
  checks_text.className="checks_text";
  var texts={
    normal:element.innerHTML,
    checked:(element.getAttr("checked_text"))?element.getAttr("checked_text"):element.innerHTML,
    disabled:(element.getAttr("disabled_text"))?element.getAttr("disabled_text"):0
  }
  element.texts=texts;
  if(checked){
    checks_text.innerHTML=texts.checked;
    element.add("checks_checked");
  }else{
    checks_text.innerHTML=texts.normal;
  }
  if(disabled){
    if(texts.disabled){
      checks_text.innerHTML=texts.disabled;
    }
    element.add("checks_disabled");
  }
  element.innerHTML="";
  element.appendChild(checks_box);
  element.appendChild(checks_text);
  element.addListener("click",function(){
    if(this.disabled){
      return;
    }
    if(this.checked){
      this.checked=false;
      this.setAttr("checked",false);
      this.remove("checks_checked");
      checks_text.innerHTML=this.texts.normal;
      __Event.emit("unchecked",{
        element:this
      },this)
    }else{
      this.checked=true;
      this.setAttr("checked",true);
      this.add("checks_checked");
      checks_text.innerHTML=this.texts.checked;
      __Event.emit("checked",{
        element:this
      },this)
    }
  })
  element.disable=function(){
    this.disabled=true;
    this.setAttr("disabled",true);
    this.add("checks_disabled");
    this.orgtext=this.innerHTML;
    if(this.texts.disabled){
      checks_text.innerHTML=this.texts.disabled;
    }
  }
  element.addListener("disable",element.disable);
  element.enable=function(){
    this.disabled=false;
    this.setAttr("disabled",false);
    this.remove("checks_disabled");
    if(this.orgtext){
      checks_text.innerHTML=this.orgtext;
    }
  }
  element.addListener("enable",element.enable);
})
__UI_radiolist={}
__UI.add('radio','standard',function(element){
  element.add("SYSUI_radio_standard");
  var checked=element.getAttr("checked");
  checked=(checked&&checked!="false")?true:false;
  var disabled=element.getAttr("disabled");
  disabled=(disabled&&disabled!="false")?true:false;
  var group=element.getAttr("group");
  group=(group)?group:0;
  var value=element.getAttr("value");
  value=(value)?value:0;
  element.value=value;
  element.group=group;
  if(group){
    if(!__UI_radiolist[group]){
      __UI_radiolist[group]={
        value:0,
        list:[]
      };
    }
    __UI_radiolist[group].list.push(element);
  }
  element.disabled=disabled;
  element.checked=checked;
  var checks_box=document.createElement('div');
  checks_box.className="checks_box";
  var checks_text=document.createElement('div');
  checks_text.className="checks_text";
  var texts={
    normal:element.innerHTML,
    checked:(element.getAttr("checked_text"))?element.getAttr("checked_text"):element.innerHTML,
    disabled:(element.getAttr("disabled_text"))?element.getAttr("disabled_text"):0
  }
  element.texts=texts;
  if(checked){
    checks_text.innerHTML=texts.checked;
    element.add("checks_checked");
  }else{
    checks_text.innerHTML=texts.normal;
  }
  if(disabled){
    if(texts.disabled){
      checks_text.innerHTML=texts.disabled;
    }
    element.add("checks_disabled");
  }
  element.innerHTML="";
  element.appendChild(checks_box);
  element.appendChild(checks_text);
  element.checks_text=checks_text;
  element.addListener("click",function(){
    if(this.disabled){
      return;
    }
    this.checked=true;
    this.setAttr("checked",true);
    this.add("checks_checked");
    checks_text.innerHTML=this.texts.checked;
    if(this.group&&__UI_radiolist[this.group]){
      __UI_radiolist[this.group].value=this.value;
      __Event.emit("radio-"+this.group+"-change",{
        value:this.value,
        element:this
      })
      var list=__UI_radiolist[this.group].list;
      for(var i=0;i<list.length;i++){
        if(list[i]!=this){
          list[i].checked=false;
          list[i].setAttr("checked",false);
          list[i].remove("checks_checked");
          list[i].checks_text.innerHTML=list[i].texts.normal;
        }
      }
    }
  })
  element.disable=function(){
    this.disabled=true;
    this.setAttr("disabled",true);
    this.add("checks_disabled");
    this.orgtext=this.innerHTML;
    if(this.texts.disabled){
      checks_text.innerHTML=this.texts.disabled;
    }
  }
  element.addListener("disable",element.disable);
  element.enable=function(){
    this.disabled=false;
    this.setAttr("disabled",false);
    this.remove("checks_disabled");
    if(this.orgtext){
      checks_text.innerHTML=this.orgtext;
    }
  }
  element.addListener("enable",element.enable);
})


//
// NS:MODEL
// REQUIRE:CORE,TEMPLATE
// NEED:NONE
//

__Model = SYSLIB.namespace("syslib.model","syslib.template");
__Model.t = function (name) {
	if(!__Model.list[name]){
		__Error.log(1,"Model : model "+name+" dosen't exist .");
	}
  	return __Model.list[name];
};
__Model.list = {};
__Model.add = function (name,html,required,initfunc,attrs,father,formats) {
  	if(__Model.list[name]) {
    	__Error.log(1,"Model : model "+name+" already exist .");
   	 	return;
  	}
  	if(required) {
    	if(required.p) {
      		SYSLIB.includePath = required.p;
    	}else{
      		SYSLIB.includePath = '';
    	}
    	SYSLIB.include(required.f);
  	}
  	if(!father) {
    	father = document.getElementById('sys_main_playground');
  	}
  	var $model = __Model.build(name,html,initfunc,attrs,father,formats);
  	__Model.list[name] = $model;
}
__Model.draw = function (name,ipts) {
  	__Model.list[name].draw(ipts);
}
__Model.setstatue = function (name,statue) {
  	__Model.list[name].setstatue(statue);
}
__Model.jump_to = function (mod,statue,setdata) {
  	if(SYS_hide_all_mod) {
    	SYS_hide_all_mod();
  	}
  	if(setdata) {
    	var tmp;
    	for(tmp in setdata) {
      		var ii = tmp+" = \'"+setdata[tmp]+"\'";
      		eval(ii);
    	}
  	}
  	setTimeout(function () {
    	_m(mod).to(statue);
  	},600);
}
__Model.build = function (name,html,initfunc,attrs,father,formats) {
  	var $this = {
      	html:html,
      	father:father,
      	id:"SYS_MD_"+name,
      	node:document.createElement("div"),
      	statues:{},
      	name:name,
      	statue:"",
      	laststatue:"",
      	formats:formats,
      	rebuild:function () {
            $this.statue = "";
            $this.laststatue = "";
            $this.node.innerHTML = __Template.build($this.html,$this.formats);
            _Dom.freshdomcache();
            if($this.initfunc) {
              	$this.initfunc();
            }
      	},
      	to:function (stname) {
            var ty = __Model.list[$this.name].statues[stname];
            if(!ty) {
            	__Error.log(1,"Model : model "+name+"'s statue "+stname+" doesn't exist .");
              	return;
            }
            if(ty.file) {
              	__Model.list[$this.name].statues[stname] = 0;
              	SYSLIB.includePath = ty.file.p;
              	if(ty.file.p) {
                  	SYSLIB.includePath = ty.file.p;
              	}else{
                  	SYSLIB.includePath = '';
              	}
              	if(ty.file.loadingani&&ty.file.loadingani.start) {
                	ty.file.loadingani.start();
              	}
              	var $stname = stname;
              	SYSLIB.include(ty.file.f);
              	var checkt = 0;
              	var tt = function check_loadok(a,b,c) {
                	if(__Model.list[a.name].statues[b]) {
                  		if(c.file.loadingani&&c.file.loadingani.ok) {
                    		c.file.loadingani.ok();
                  		}
                  		var $a = a;
                  		setTimeout(function () {$a.to($stname);},2000)
                  		clearInterval(checkt);
                  		return;
                	}
                	console.log('nothis');
              	};
              	var $stname = stname;
              	checkt = setInterval(function () {tt($this,$stname,ty);},500);
              
              	return;
            }
            __Model.list[$this.name].statues[stname]();
            $this.statue = stname;
            if(stname!= "hide") {
              	$this.laststatue = stname;
            }
      	},
    	addstatue:function (stname,stfunc,required,delyloadme) {
            if(__Model.list[$this.name].statues[stname]) {
              	__Error.log(1,"Model : model "+name+"'s statue "+stname+" already exist .");
              	return;
            }
            if(delyloadme) {
              	__Model.list[$this.name].statues[stname] = {file:delyloadme};
            }else{
              	__Model.list[$this.name].statues[stname] = stfunc;
              	if(required) {
                	if(required.p) {
                  		SYSLIB.includePath = required.p;
                	}else{
                  		SYSLIB.includePath = '';
                	}
                	SYSLIB.include(required.f);
              	}
        	}
            
    	}
  	};
  	$this.node.innerHTML = __Template.build(html,formats);
  	$this.node.id = $this.id;
  	if(initfunc) {
      	$this.initfunc = initfunc;
  	}
  	if(attrs) {
    	for(var $attr in attrs) {
      		$this.node.setAttribute($attr,attrs[$attr]);
    	}
  	}
  	father.appendChild($this.node);
  	if($this.initfunc) {
      	$this.initfunc();
  	}
  	return $this;
}

//short cuts
var _m = SYSLIB.namespace("syslib.model").t,
	JUMP_TO = SYSLIB.namespace("syslib.model").jump_to;


//
// NS:AJAX
// REQUIRE:CORE
// NEED:NONE
//

////////////////// external reqiurement

/*ajax !
  * snack.js (c) Ryan Florence
  * https://github.com/rpflorence/snack
  * MIT License
  * Inspiration and code adapted from
  *  MooTools      (c) Valerio Proietti   MIT license
  *  jQuery        (c) John Resig         Dual license MIT or GPL Version 2
  *  contentLoaded (c) Diego Perini       MIT License
  *  Zepto.js      (c) Thomas Fuchs       MIT License
*/
typeof Object.create!="function"&&(Object.create=function(a){function b(){}b.prototype=a;return new b}),!function(a){var b=a.snack={},c=0,d=Object.prototype.toString,e=[].indexOf,f=[].push;b.extend=function(){if(arguments.length==1)return b.extend(b,arguments[0]);var a=arguments[0];for(var c,d=1,e=arguments.length;d<e;d++)for(c in arguments[d])a[c]=arguments[d][c];return a},b.extend({v:"1.2.3",bind:function(a,b,c){c=c||[];return function(){f.apply(c,arguments);return a.apply(b,c)}},punch:function(a,c,d,e){var f=a[c];a[c]=e?function(){f.apply(a,arguments);return d.apply(a,arguments)}:function(){var c=[].slice.call(arguments,0);c.unshift(b.bind(f,a));return d.apply(a,c)}},create:function(a,c){var d=Object.create(a);if(!c)return d;for(var e in c){if(!c.hasOwnProperty(e))continue;if(!a[e]||typeof c[e]!="function"){d[e]=c[e];continue}b.punch(d,e,c[e])}return d},id:function(){return++c},each:function(a,b,c){if(a.length===void 0){for(var d in a)a.hasOwnProperty(d)&&b.call(c,a[d],d,a);return a}for(var e=0,f=a.length;e<f;e++)b.call(c,a[e],e,a);return a},parseJSON:function(b){if(typeof b=="string"){b=b.replace(/^\s+|\s+$/g,"");var c=/^[\],:{}\s]*$/.test(b.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""));if(!c)throw"Invalid JSON";var d=a.JSON;return d&&d.parse?d.parse(b):(new Function("return "+b))()}},isArray:function(a){return a instanceof Array||d.call(a)=="[object Array]"},indexOf:e?function(a,b){return e.call(b,a)}:function(a,b){for(var c=0,d=b.length;c<d;c++)if(b[c]===a)return c;return-1}})}(window),!function(a,b){var c={},d;a.wrap=function(b,e){typeof b=="string"&&(b=d(b,e)),b.length||(b=[b]);var f=Object.create(c),g=0,h=b.length;for(;g<h;g++)f[g]=b[g];f.length=h,f.id=a.id();return f},a.extend(a.wrap,{define:function(b,d){if(typeof b!="string")for(var e in b)a.wrap.define(e,b[e]);else c[b]=d},defineEngine:function(a){d=a}}),a.wrap.defineEngine(function(a,c){typeof c=="string"&&(c=b.querySelector(c));return(c||b).querySelectorAll(a)})}(snack,document),!function(a,b,c){function l(){try{i.doScroll("left")}catch(a){setTimeout(l,50);return}k("poll")}function k(d){if(d.type!="readystatechange"||c.readyState=="complete")(d.type=="load"?b:c)[e](f+d.type,k,!1),!g&&(g=!0)&&a.each(j,function(a){a.apply(c)})}var d=c.addEventListener?"addEventListener":"attachEvent",e=c.addEventListener?"removeEventListener":"detachEvent",f=c.addEventListener?"":"on",g=!1,h=!0,i=c.documentElement,j=[];a.extend({stopPropagation:function(a){a.stopPropagation?a.stopPropagation():a.cancelBubble=!0},preventDefault:function(a){a.preventDefault?a.preventDefault():a.returnValue=!1}}),a.listener=function(b,g){b.delegate&&(b.capture=!0,_handler=g,g=function(d){var e=d.target||d.srcElement,f=typeof b.delegate=="string"?a.wrap(b.delegate,b.node):b.delegate(b.node);while(e&&a.indexOf(e,f)==-1)e=e.parentNode;e&&e!==this&&e!==c&&_handler.call(e,d,e)}),b.context&&(g=a.bind(g,b.context));var h={attach:function(){b.node[d](f+b.event,g,b.capture)},detach:function(){b.node[e](f+b.event,g,b.capture)},fire:function(){g.apply(b.node,arguments)}};h.attach();return h},a.ready=function(a){g?a.apply(c):j.push(a)};if(c.createEventObject&&i.doScroll){try{h=!b.frameElement}catch(m){}h&&l()}c[d](f+"DOMContentLoaded",k,!1),c[d](f+"readystatechange",k,!1),b[d](f+"load",k,!1)}(snack,window,document),!function(a){a.publisher=function(b){var c={};b=b||{},a.extend(b,{subscribe:function(b,d,e){var f={fn:d,ctxt:e||{}};c[b]||(c[b]=[]);var g={attach:function(){c[b].push(f)},detach:function(){c[b].splice(a.indexOf(d,c[b]),1)}};g.attach();return g},publish:function(b,d){if(!c[b])return!1;a.each(c[b],function(a){a.fn.apply(a.ctxt,d||[])});return c[b].length}});return b},a.publisher(a)}(snack),!function(a,b,c){function e(){}a.JSONP=function(b,d){var e="jsonp"+a.id(),f=c.createElement("script"),g=!1;a.JSONP[e]=function(b){g=!1,delete a.JSONP[e],d(b)},typeof b.data=="object"&&(b.data=a.toQueryString(b.data));var h={send:function(){g=!0,f.src=b.url+"?"+b.key+"=snack.JSONP."+e+"&"+b.data,c.getElementsByTagName("head")[0].appendChild(f)},cancel:function(){g&&f.parentNode&&f.parentNode.removeChild(f),g=!1,a.JSONP[e]=function(){delete a.JSONP[e]}}};b.now!==!1&&h.send();return h},a.toQueryString=function(b,c){var d=[];a.each(b,function(b,e){c&&(e=c+"["+e+"]");var f;if(a.isArray(b)){var g={};a.each(b,function(a,b){g[b]=a}),f=a.toQueryString(g,e)}else typeof b=="object"?f=a.toQueryString(b,e):f=e+"="+encodeURIComponent(b);b!==null&&d.push(f)});return d.join("&")};var d=function(){var a=function(){return new XMLHttpRequest},b=function(){return new ActiveXObject("MSXML2.XMLHTTP")},c=function(){return new ActiveXObject("Microsoft.XMLHTTP")};try{a();return a}catch(d){try{b();return b}catch(d){c();return c}}}();a.request=function(b,c){if(!(this instanceof a.request))return new a.request(b,c);var e=this;e.options=a.extend({},e.options,b),e.callback=c,e.xhr=new d,e.headers=e.options.headers,e.options.now!==!1&&e.send()},a.request.prototype={options:{exception:e,url:"",data:"",method:"get",now:!0,headers:{"X-Requested-With":"XMLHttpRequest",Accept:"text/javascript, text/html, application/xml, text/xml, */*"},async:!0,emulation:!0,urlEncoded:!0,encoding:"utf-8"},onStateChange:function(){var a=this,b=a.xhr;if(b.readyState==4&&!!a.running){a.running=!1,a.status=0;try{var c=b.status;a.status=c==1223?204:c}catch(d){}b.onreadystatechange=e;var f=a.status>=200&&a.status<300?[!1,a.xhr.responseText||"",a.xhr.responseXML]:[a.status];a.callback.apply(a,f)}},setHeader:function(a,b){this.headers[a]=b;return this},getHeader:function(a){try{return this.xhr.getResponseHeader(a)}catch(b){return null}},send:function(){var b=this,d=b.options;if(b.running)return b;b.running=!0;var e=d.data||"",f=String(d.url),g=d.method.toLowerCase();typeof e!="string"&&(e=a.toQueryString(e));if(d.emulation&&a.indexOf(g,["get","post"])<0){var h="_method="+g;e=e?h+"&"+e:h,g="post"}if(d.urlEncoded&&a.indexOf(g,["post","put"])>-1){var i=d.encoding?"; charset="+d.encoding:"";b.headers["Content-type"]="application/x-www-form-urlencoded"+i}f||(f=c.location.pathname);var j=f.lastIndexOf("/");j>-1&&(j=f.indexOf("#"))>-1&&(f=f.substr(0,j)),e&&g=="get"&&(f+=(f.indexOf("?")>-1?"&":"?")+e,e=null);var k=b.xhr;k.open(g.toUpperCase(),f,open.async,d.user,d.password),d.user&&"withCredentials"in k&&(k.withCredentials=!0),k.onreadystatechange=a.bind(b.onStateChange,b);for(var l in b.headers)try{k.setRequestHeader(l,b.headers[l])}catch(m){d.exception.apply(b,[l,b.headers[l]])}k.send(e),d.async||b.onStateChange();return b},cancel:function(){var a=this;if(!a.running)return a;a.running=!1;var b=a.xhr;b.abort(),b.onreadystatechange=e,a.xhr=new d;return a}}}(snack,window,document),!function(a,b){function d(b,c,d,e){var f=b.data(d);f&&a.each(f,function(a){a[c].apply(b,e)});return b}function c(a){return a.replace(/\s+/g," ").replace(/^\s+|\s+$/g,"")}a.wrap.define({data:function(){var a={};return function(b,c){var d=a[this.id];d||(d=a[this.id]={});if(c===void 1)return d[b];return d[b]=c}}(),each:function(b,c){return a.each(this,b,c)},addClass:function(a){return this.each(function(b){c(b.className).indexOf(a)>-1||(b.className=c(b.className+" "+a))})},removeClass:function(a){return this.each(function(b){b.className=b.className.replace(new RegExp("(^|\\s)"+a+"(?:\\s|$)"),"$1")})},attach:function(b,c,d){var e=b.split("."),f=[];e[1]&&(f=this.data(e[1])||[]),this.each(function(b){var g={node:b,event:e[0]};d&&(g.delegate=d),f.push(a.listener(g,c))}),e[1]&&this.data(e[1],f);return this},detach:function(a){d(this,"detach",a,null,!0),this.data(a,null);return this},fire:function(a,b){return d(this,"fire",a,b)},delegate:function(a,b,c){return this.attach(a,c,b)}})}(snack,document)

/////////////////


__Ajax=SYSLIB.namespace("syslib.ajax");
__Ajax.post = function (api,datas,rf_success,rf_error,notasync,timeout) {
  	var async = (notasync)?false:true;
  	snack.request({
     	method:"post",
     	url:api,
		format:"json",
     	data:datas,
     	async:async,
     	timeout:(timeout)?timeout:36000
    },
    function (err,data) {
	 	data=JSON.parse(data);
		if(err){
			if(rf_error) {
     			rf_error(errorThrown);
				return;
  			}
		}
   		if(rf_success) {
     		rf_success(data);
   		}
	});
}
__Ajax.getfile = function (url,rf_success,rf_error,async) {
  	var $tt = "";
  	snack.request({
     	method:"get",
     	format:"html",
     	url:url,
     	async:(async)?async:false,
     	timeout:36000
     },
     function (err,data) {
		if(err){
			if(rf_error) {
         		rf_error(errorThrown);
				return;
      		}
		}
       	if(rf_success) {
         	rf_success(data);
       	}else{
         	$tt =  data;
       	}
  	});
  	return $tt;
}
__Ajax.load = function (file,cb,err) {
  	snack.request({
        method:"get",
        dataType:"html",
        url:file,
        timeout:100000
    },function (err2,data) {
		if(err2){
			if(err) {
         		err(err2);
				return;
      		}
		}
        if(cb) {
            cb(data);
        }
        return data;
    });
}

//short cuts
var _post = SYSLIB.namespace("syslib.ajax").post;
//
// NS:Vilade
// REQUIRE:CORE
// NEED:NONE
//
__Vilade=SYSLIB.namespace("syslib.vilade")
__Vilade.list = {
	"email":function (ipt) {
    	// contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
    	return /^((([a-z]|\d|[!#\$%&'\*\+\-\/ = \?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/ = \?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(ipt);
  	},
  	"url":function (ipt) {
    	// contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
    	return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,; = ]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,; = ]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,; = ]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,; = ]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,; = ]|:|@)|\/|\?)*)?$/i.test(ipt);
  	},
  	"date":function (ipt) {
    	return !/Invalid|NaN/.test(new Date(ipt).toString());
  	},
  	"dateISO":function (ipt) {
    	return /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(ipt);
  	},
  	"number":function (ipt) {
    	return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(ipt);
  	},
  	"digits":function (ipt) {
    	return /^\d+$/.test(ipt);
  	},
  	"letterswithbasicpunc":function (ipt) {
    	return /^[a-z\-.,()'"\s]+$/i.test(ipt);
  	},
  	"alpha+numer":function (ipt) {
    	return /^\w+$/i.test(ipt);
  	},
  	"lettersonly":function (ipt) {
   		return /^[a-z]+$/i.test(ipt);
  	},
  	"nowhitespace":function (ipt) {
    	return /^\S+$/i.test(ipt);
  	},
  	"int":function (ipt) {
    	return /^-?\d+$/.test(ipt);
  	},
  	"+int":function (ipt) {
    	return /^[0-9]*[1-9][0-9]*$/.test(ipt);
  	},
  	"0+int":function (ipt) {
    	return /^\d+$/.test(ipt);
  	},
  	"0-int":function (ipt) {
    	return /^((-\d+)|(0+))$/.test(ipt);
  	},
  	"-int":function (ipt) {
    	return /^-[0-9]*[1-9][0-9]*$/.test(ipt);
  	},
  	"0+float":function (ipt) {
    	return /^\d+(\.\d+)?$/.test(ipt);
  	},
  	"+float":function (ipt) {
    	return /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/.test(ipt);
  	},
  	"0-float":function (ipt) {
    	return /^((-\d+(\.\d+)?)|(0+(\.0+)?))$/.test(ipt);
  	},
  	"-float":function (ipt) {
    	return /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/.test(ipt);
  	},
  	"float":function (ipt) {
    	return /^(-?\d+)(\.\d+)?$/.test(ipt);
  	},
  	"alpha":function (ipt) {
    	return /^[A-Za-z]+$/.test(ipt);
  	},
  	"ualpha":function (ipt) {
    	return /^[A-Z]+$/.test(ipt);
  	},
  	"lalpha":function (ipt) {
    	return /^[a-z]+$/.test(ipt);
  	},
  	"chinesemobile":function (ipt) {
    	return /^1[3|4|5|8][0-9]\d{4,8}$/.test(ipt);
  	},
  	"chineseid":function (idcard) {
	    var area = {11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"},
	        idcard,Y,JYM,
	        S,M,
	        idcard_array  =  new Array(),
	        idcard_array  =  idcard.split("");
    	//地区检验
    	if(area[parseInt(idcard.substr(0,2))] == null) {
      		return false;//"身份证地区非法!"
    	}
    	//身份号码位数及格式检验
    	switch(idcard.length) {
      		case 15:
          		if ( (parseInt(idcard.substr(6,2))+1900) % 4  ==  0 || ((parseInt(idcard.substr(6,2))+1900) % 100  ==  0 && (parseInt(idcard.substr(6,2))+1900) % 4  ==  0 )) {
            		ereg = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}$/;//测试出生日期的合法性
          		}else{
            		ereg = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}$/;//测试出生日期的合法性
          		}
          		if(ereg.test(idcard)) {
            		return true;
          		}else{
            		return false;//"身份证号码出生日期超出范围或含有非法字符!",
          		}
          		break;
      		case 18:
		        //18位身份号码检测
		        //出生日期的合法性检查
		        //闰年月日:((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))
		        //平年月日:((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))
		        if ( parseInt(idcard.substr(6,4)) % 4  ==  0 || (parseInt(idcard.substr(6,4)) % 100  ==  0 && parseInt(idcard.substr(6,4))%4  ==  0 )) {
              		ereg = /^[1-9][0-9]{5}19[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}[0-9Xx]$/;//闰年出生日期的合法性正则表达式
          		}else{
              		ereg = /^[1-9][0-9]{5}19[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}[0-9Xx]$/;//平年出生日期的合法性正则表达式
          		}
          		if(ereg.test(idcard)) {//测试出生日期的合法性
              		//计算校验位
            		S  =  (parseInt(idcard_array[0]) + parseInt(idcard_array[10])) * 7
			            + (parseInt(idcard_array[1]) + parseInt(idcard_array[11])) * 9
			            + (parseInt(idcard_array[2]) + parseInt(idcard_array[12])) * 10
			            + (parseInt(idcard_array[3]) + parseInt(idcard_array[13])) * 5
			            + (parseInt(idcard_array[4]) + parseInt(idcard_array[14])) * 8
			            + (parseInt(idcard_array[5]) + parseInt(idcard_array[15])) * 4
			            + (parseInt(idcard_array[6]) + parseInt(idcard_array[16])) * 2
			            + parseInt(idcard_array[7]) * 1
			            + parseInt(idcard_array[8]) * 6
			            + parseInt(idcard_array[9]) * 3 ;
            		Y  =  S % 11;
            		M  =  "F";
            		JYM  =  "10X98765432";
            		M  =  JYM.substr(Y,1);//判断校验位
            		if(M  ==  idcard_array[17]) {
              			return true;
            		}else{
              			return false;//"身份证号码校验错误!",
            		}
          		}else{
            		return false;//"身份证号码出生日期超出范围或含有非法字符!",
          		}
          		break;
    		default:
      			return false;// "身份证号码位数不对!",
      			break;
    	}
  	},
  	"sysupass":function (ipt) {
    	return /^[0-9a-zA-Z\!\?\@\#\$\%\^\&\*\(\)\[\]\{\}\|\\]{6,64}$/.test(ipt);
  	},
  	"systag":function (ipt) {
    	return /^[0-9a-zA-Z\u4e00-\u9fa5\']{1,4}$/.test(ipt);
  	},
  	"sysitemname":function (ipt) {
    	return /^[\S]{1,24}$/.test(ipt);
  	},
  	"chineseonly":function (ipt) {
    	return /^[\u4e00-\u9fa5]{1,}$/.test(ipt);
  	},
  	"sysuname":function (ipt) {
    	return /^[0-9a-zA-Z\u4e00-\u9fa5\_]{1,12}$/.test(ipt);
  	}
}
__Vilade.vilade = function (ipt,rule) {
  	if(__Vilade.list[rule]) {
   		return __Vilade.list[rule](ipt);
  	}else{
  		__Error.log(2,"Vilade : can't find "+rule);
  	}
}

//short cuts
var _is = SYSLIB.namespace("syslib.vilade").vilade;
//
// NS:COOKIES
// REQUIRE:CORE
// NEED:NONE
//
__Cookies=SYSLIB.namespace("syslib.cookies");
__Cookies.get = function (c_name,defaultvar) {
  	var $defaultvar = defaultvar||"";
  	if (document.cookie.length>0){
      	c_start = document.cookie.indexOf(c_name + " = ");
		if(c_start==-1){
			c_start = document.cookie.indexOf(c_name + "=");
		}
      	if (c_start!= -1){ 
	        c_start = c_start + c_name.length+1;
	        c_end = document.cookie.indexOf(";",c_start);
        	if (c_end == -1) {
        		c_end = document.cookie.length;
       		} 
      		var $rvar = unescape(document.cookie.substring(c_start,c_end));
      		return ($rvar!= "")?$rvar:$defaultvar;
      	}else{
      		return $defaultvar;
      	}
  	}else{
  		return $defaultvar;
  	}
}
__Cookies.set = function (c_name,value,expiredays) {
  	var exdate = new Date();
  	exdate.setDate(exdate.getDate()+(expiredays||14));
  	document.cookie = c_name+ " = " +escape(value)+((expiredays == null) ? "" : ";expires = "+exdate.toGMTString()+"; path = /");
}
__Cookies.clean = function (c_name) {
  	__Cookies.set(c_name,"");
}

//
// NS:FILE
// REQUIRE:CORE
// NEED:NONE
//
////////////////// external reqiurement

/*filer.js*/var self=this;self.URL=self.URL||self.webkitURL;self.requestFileSystem=self.requestFileSystem||self.webkitRequestFileSystem;self.resolveLocalFileSystemURL=self.resolveLocalFileSystemURL||self.webkitResolveLocalFileSystemURL;navigator.temporaryStorage=navigator.temporaryStorage||navigator.webkitTemporaryStorage;navigator.persistentStorage=navigator.persistentStorage||navigator.webkitPersistentStorage;self.BlobBuilder=self.BlobBuilder||self.MozBlobBuilder||self.WebKitBlobBuilder;
if(void 0===self.FileError){var FileError=function(){};FileError.prototype.prototype=Error.prototype}
var Util={toArray:function(a){return Array.prototype.slice.call(a||[],0)},strToDataURL:function(a,b,c){return(void 0!=c?c:1)?"data:"+b+";base64,"+self.btoa(a):"data:"+b+","+a},strToObjectURL:function(a,b){for(var c=new Uint8Array(a.length),d=0;d<c.length;++d)c[d]=a.charCodeAt(d);c=new Blob([c],b?{type:b}:{});return self.URL.createObjectURL(c)},fileToObjectURL:function(a){return self.URL.createObjectURL(a)},fileToArrayBuffer:function(a,b,c){var d=new FileReader;d.onload=function(a){b(a.target.result)};
d.onerror=function(a){c&&c(a)};d.readAsArrayBuffer(a)},dataURLToBlob:function(a){if(-1==a.indexOf(";base64,")){var b=a.split(","),a=b[0].split(":")[1],b=b[1];return new Blob([b],{type:a})}for(var b=a.split(";base64,"),a=b[0].split(":")[1],b=window.atob(b[1]),c=b.length,d=new Uint8Array(c),i=0;i<c;++i)d[i]=b.charCodeAt(i);return new Blob([d],{type:a})},arrayBufferToBlob:function(a,b){var c=new Uint8Array(a);return new Blob([c],b?{type:b}:{})},arrayBufferToBinaryString:function(a,b,c){var d=new FileReader;
d.onload=function(a){b(a.target.result)};d.onerror=function(a){c&&c(a)};a=new Uint8Array(a);d.readAsBinaryString(new Blob([a]))},arrayToBinaryString:function(a){if("object"!=typeof a)return null;for(var b=a.length,c=Array(b);b--;)c[b]=String.fromCharCode(a[b]);return c.join("")},getFileExtension:function(a){var b=a.lastIndexOf(".");return-1!=b?a.substring(b):""}},MyFileError=function(a){this.prototype=FileError.prototype;this.code=a.code;this.name=a.name};FileError.BROWSER_NOT_SUPPORTED=1E3;
FileError.prototype.__defineGetter__("name",function(){for(var a=Object.keys(FileError),b=0,c;c=a[b];++b)if(FileError[c]==this.code)return c;return"Unknown Error"});
var Filer=new function(){function a(e){if(b=e||null)c=b.root,d=!0}var b=null,c=null,d=!1,i=function(e){return 0==e.indexOf("filesystem:")},k=function(e){i(e)||(e="/"==e[0]?b.root.toURL()+e.substring(1):0==e.indexOf("./")||0==e.indexOf("../")?"../"==e&&c!=b.root?c.toURL()+"/"+e:c.toURL()+e:c.toURL()+"/"+e);return e},l=function(e,a){var b=arguments[1],c=arguments[2],g=function(e){if(e.code==FileError.NOT_FOUND_ERR){if(c)throw Error('"'+b+'" or "'+c+'" does not exist.');throw Error('"'+b+'" does not exist.');
}throw Error("Problem getting Entry for one or more paths.");},m=k(b);if(3==arguments.length){var d=k(c);self.resolveLocalFileSystemURL(m,function(a){self.resolveLocalFileSystemURL(d,function(b){e(a,b)},g)},g)}else self.resolveLocalFileSystemURL(m,e,g)},p=function(e,a,c,f,g,m){if(!b)throw Error("Filesystem has not been initialized.");if(typeof e!=typeof a)throw Error("These method arguments are not supported.");var d=c||null,n=void 0!=m?m:!1;(e.isFile||a.isDirectory)&&a.isDirectory?n?e.moveTo(a,d,
f,g):e.copyTo(a,d,f,g):l(function(e,a){if(a.isDirectory)n?e.moveTo(a,d,f,g):e.copyTo(a,d,f,g);else{var b=Error('Oops! "'+a.name+" is not a directory!");if(g)g(b);else throw b;}},e,a)};a.DEFAULT_FS_SIZE=1048576;a.version="0.4.1";a.prototype={get fs(){return b},get isOpen(){return d},get cwd(){return c}};a.prototype.pathToFilesystemURL=function(a){return k(a)};a.prototype.init=function(a,j,h){if(!self.requestFileSystem)throw new MyFileError({code:FileError.BROWSER_NOT_SUPPORTED,name:"BROWSER_NOT_SUPPORTED"});
var a=a?a:{},f=a.size||1048576;this.type=self.TEMPORARY;if("persistent"in a&&a.persistent)this.type=self.PERSISTENT;var g=function(a){this.size=f;b=a;c=b.root;d=!0;j&&j(a)};this.type==self.PERSISTENT&&navigator.persistentStorage?navigator.persistentStorage.requestQuota(f,function(a){self.requestFileSystem(this.type,a,g.bind(this),h)}.bind(this),h):self.requestFileSystem(this.type,f,g.bind(this),h)};a.prototype.ls=function(a,j,h){if(!b)throw Error("Filesystem has not been initialized.");var f=function(a){c=
a;var e=[],b=c.createReader(),f=function(){b.readEntries(function(a){a.length?(e=e.concat(Util.toArray(a)),f()):(e.sort(function(a,e){return a.name<e.name?-1:e.name<a.name?1:0}),j(e))},h)};f()};a.isDirectory?f(a):i(a)?l(f,k(a)):c.getDirectory(a,{},f,h)};a.prototype.mkdir=function(a,j,h,f){if(!b)throw Error("Filesystem has not been initialized.");var g=null!=j?j:!1,d=a.split("/"),o=function(b,c){if("."==c[0]||""==c[0])c=c.slice(1);b.getDirectory(c[0],{create:!0,exclusive:g},function(b){if(b.isDirectory)c.length&&
1!=d.length?o(b,c.slice(1)):h&&h(b);else if(b=Error(a+" is not a directory"),f)f(b);else throw b;},function(b){if(b.code==FileError.INVALID_MODIFICATION_ERR)if(b.message="'"+a+"' already exists",f)f(b);else throw b;})};o(c,d)};a.prototype.open=function(a,c,d){if(!b)throw Error("Filesystem has not been initialized.");a.isFile?a.file(c,d):l(function(a){a.file(c,d)},k(a))};a.prototype.create=function(a,d,h,f){if(!b)throw Error("Filesystem has not been initialized.");c.getFile(a,{create:!0,exclusive:null!=
d?d:!0},h,function(b){if(b.code==FileError.INVALID_MODIFICATION_ERR)b.message="'"+a+"' already exists";if(f)f(b);else throw b;})};a.prototype.mv=function(a,b,c,f,d){p.bind(this,a,b,c,f,d,!0)()};a.prototype.rm=function(a,c,d){if(!b)throw Error("Filesystem has not been initialized.");var f=function(a){a.isFile?a.remove(c,d):a.isDirectory&&a.removeRecursively(c,d)};a.isFile||a.isDirectory?f(a):l(f,a)};a.prototype.cd=function(a,d,h){if(!b)throw Error("Filesystem has not been initialized.");a.isDirectory?
(c=a,d&&d(c)):(a=k(a),l(function(a){if(a.isDirectory)c=a,d&&d(c);else if(a=Error("Path was not a directory."),h)h(a);else throw a;},a))};a.prototype.cp=function(a,b,c,d,g){p.bind(this,a,b,c,d,g)()};a.prototype.write=function(a,d,h,f){if(!b)throw Error("Filesystem has not been initialized.");var g=function(a){a.createWriter(function(b){b.onerror=f;if(d.append)b.onwriteend=function(){h&&h(a,this)},b.seek(b.length);else{var c=!1;b.onwriteend=function(){c?h&&h(a,this):(c=!0,this.truncate(this.position))}}if(d.data.__proto__==
ArrayBuffer.prototype)d.data=new Uint8Array(d.data);var e=new Blob([d.data],d.type?{type:d.type}:{});b.write(e)},f)};a.isFile?g(a):i(a)?l(g,a):c.getFile(a,{create:!0,exclusive:!1},g,f)};return a};

/////////////////
__File=SYSLIB.namespace("syslib.file");
__File.file = new Filer();
__File.save_to_ls = function (data,totalsizeinmb,filepath,encodetype) {
  	if(!data||!filepath) {
    	return;
  	}
 	if(!totalsizeinmb) {
    	var totalsizeinmb = 10;
  	}
  	if(!encodetype) {
    	var encodetype = 0;
  	}
  	switch(encodetype) {
    	case 1:
      		data = JSON.stringify(data);
      		break;
  	}
  	__File.file.init({persistent: true, size: totalsizeinmb*1024 * 1024}, function (fs) {
	    var eee = function () {
	      	__File.file.write(filepath, {data: data, type: 'application/octet-stream'},function (fileEntry) {
	      	},
	        function () {
	            __Error.log(2,"File : Faild To save files "+filepath);
	        });
	    }
    	eee();  
	    //try{
	    //  SYSLIB_utils.file.rm(filepath,function () {
	    //    eee();    
	    //  },function () {
	    //    console.log('Faild To save files')
	    //  })
	    //}catch(e) {
	    //  eee();
	    //}
	}, function () {
  		__Error.log(2,"File : Faild To save files "+filepath);
	});
};
__File.load_from_ls = function (filepath,decodetype,scb) {
  	if(!filepath) {
    	scb(0);
    	return;
  	}
  	var decodeandreturn = function (data) {
    	switch(decodetype) {
      		case 1:
        		data = JSON.parse(data);
        		break;
    	}
    	scb(data);
  	}
  	try{
      	__File.file.init({persistent: true, size: 200*1024 * 1024}, function (fs) {
         	__File.file.open(filepath,function (file) {
            	var reader  =  new FileReader();
            	reader.onload  =  (function (theFile) {
              		return function (e) {
                		decodeandreturn(e.target.result);
              		};
            	})(file);
            	reader.readAsText(file);
        	},function () {
            	__Error.log(2,"File : Faild To open files "+filepath);
            	scb(0);
        	});
   		}, function () {
        	__Error.log(2,"File : Faild To open files "+filepath);
        	scb(0);
      	});
    }catch(e) {
      scb(0);
    }
}
//
// NS:GEO
// REQUIRE:CORE
// NEED:NONE
//
__Geo=SYSLIB.namespace("syslib.geo");
__Geo.get=function (scb,err) {
  	var getgeo = function (scb,scb2,err) {
    	if (navigator.geolocation) {
          	navigator.geolocation.getCurrentPosition(scb,function (error) {
        		switch(error.code) {
		            case error.PERMISSION_DENIED:
		                console.log("GEO: User denied the request for Geolocation.");
		                break;
		            case error.POSITION_UNAVAILABLE:
		                console.log("GEO: Location information is unavailable.");
		                break;
		            case error.TIMEOUT:
		                console.log("GEO: The request to get user location timed out.");
		                break;
		            case error.UNKNOWN_ERROR:
		                console.log("GEO: An unknown error occurred.");
		                break;
            	}
        		if(scb2) {
        			scb2();
        		}else{ 
        			if(err) {
        				err();
        			}
        		}
      		});
       	}else{
      		if(scb2) {
      			scb2();
      		}
    	}
  	}
  	getgeo(function (e) {
    	snack.JSONP({
       		url:'http://api.map.baidu.com/geocoder/v2/',
			key:'callback',
       		data:{ak:'6f7bcd8ebbe8209777f27f32fed49746',location:(e.coords.latitude+","+e.coords.longitude),output:'json',pois:1}
       	},function (data) {
	        if(!data||!data.result) {
	          	return err();
	        }
	        var pos = {
	          	accuracy:e.coords.accuracy,
	          	altitude:e.coords.altitude,
	          	altitudeAccuracy:e.coords.altitudeAccuracy,
	          	heading:e.coords.heading,
	          	latitude:e.coords.latitude,
	          	longitude:e.coords.longitude,
	          	speed:e.coords.speed,
	          	timestamp:e.timestamp,
	          	address:data.result.formatted_address,
	          	city:data.result.addressComponent.city,
	          	district:data.result.addressComponent.district,
	          	province:data.result.addressComponent.province,
	          	street:data.result.addressComponent.street,
	          	street_number:data.result.addressComponent.street_number
	        }
        	scb(pos);
    	});
  	},function (e) {
    	snack.JSONP({
	       	url:'http://api.map.baidu.com/location/ip',
	       	data:{ak:'6f7bcd8ebbe8209777f27f32fed49746'},
	       	key:'callback'
	    },function (data) {
	        if(!data||!data.content) {
	          	return err();
	        }
	        var pos = {
	          	accuracy:0,
	          	altitude:0,
	          	altitudeAccuracy:0,
	          	heading:0,
	          	latitude:data.content.point.x,
	          	longitude:data.content.point.y,
	          	speed:0,
	          	timestamp:(new Date()).getTime(),
	          	address:data.content.address,
	          	city:data.content.address_detail.city,
	          	district:data.content.address_detail.district,
	          	province:data.content.address_detail.province,
	          	street:data.content.address_detail.street,
	          	street_number:data.content.address_detail.street_number
	        }
        	scb(pos);
    	});
  	},err)
}


//
// NS:SOUND
// REQUIRE:CORE
// NEED:NONE
//
__Sound=SYSLIB.namespace("syslib.sound")
__Sound.list = [];
__Sound.add = function (name,url) {
  	if(!__Sound.list[name]) {
    	__Sound.list[name] = url;
  	}else{
  		__Error.log(1,"Sound : sound "+name+" is already exist.");
  	}
}
__Sound.device = document.createElement("audio");
__Sound.play = function (name) {
  	__Sound.device.src = __Sound.list[name];
  	__Sound.device.play();
}



//
// NS:UTIL
// REQUIRE:CORE
// NEED:NONE
//
var __Util=SYSLIB.namespace("syslib.util");
// ua
__Util.UA=function(){
	var n=window.navigator&&navigator.userAgent||"";
	return{
		isChrome:(/webkit\W.*(chrome|chromium)\W/i).test(n),
		isFirefox:(/mozilla.*\Wfirefox\W/i).test(n),
		isGecko:(/mozilla(?!.*webkit).*\Wgecko\W/i).test(n),
		isIE:function(){ return navigator.appName==="Microsoft Internet Explorer"; },
		isKindle:(/\W(kindle|silk)\W/i).test(n),
		isMobile:(/(iphone|ipod|(android.*?mobile)|blackberry|nokia)/i).test(n),
		isOpera:(/opera.*\Wpresto\W/i).test(n),
		isSafari:(/webkit\W(?!.*chrome).*safari\W/i).test(n),
		isTablet:(/(ipad|android(?!.*mobile))/i).test(n),
		isTV:(/googletv|sonydtv/i).test(n),
		isWebKit:(/webkit\W/i).test(n),
		isAndroid:(/android/i).test(n),
		isIOS:(/(ipad|iphone|ipod)/i).test(n),
		isIPad:(/ipad/i).test(n),
		isIPhone:(/iphone/i).test(n),
		isIPod:(/ipod/i).test(n),
		whoami:function(){ return n }
	}
}
__Util.checkFather = function (that,e) {
  var parent  =  e.relatedTarget;
         try {
            while ( parent && parent !==  that ) {
                parent  =  parent.parentNode; 
            }
            return (parent !==  that);
        } catch(e) { }
}
__Util.globalposition =  function (node) {
            var $d  =  node,$c = {x:0,y:0};
            for (; null !=  $d ;) {
                $c.x +=  $d.offsetLeft;
                $c.y +=  $d.offsetTop;
                $d  =  $d.offsetParent
            }
            return $c
};
__Util.title= function (ipt) {
  	document.title = ipt;
}
__Util.brhistory=function (action) {
	var $state = {
	  	title:document.title,
	    url:window.location.href,
	    action:(action)?action:0
	}
  	history.pushState($state,$state['title'],$state['url']);
}
__Util.url=function (ipt) {
  	window.location.href = SYSLIB.baseurl+"#"+ipt;
}
__Util.preventDefault=function (e) {
 	e  =  e || window.event;
  	if (e.preventDefault){
      	e.preventDefault();
  	}
  	e.returnValue  =  false;  
}
__Util.clone=function (obj) {
    // Handle the 3 simple types, and null or undefined
    if (null  ==  obj || "object" !=  typeof obj) return obj;
    // Handle Date
    if (obj instanceof Date) {
        var copy  =  new Date();
        copy.setTime(obj.getTime());
        return copy;
    }
    // Handle Array
    if (obj instanceof Array) {
        var copy  =  [];
        for (var i  =  0, len  =  obj.length; i < len; i++) {
            copy[i]  =  __Util.clone(obj[i]);
        }
        return copy;
    }
    // Handle Object
    if (obj instanceof Object) {
        var copy  =  {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr]  =  __Util.clone(obj[attr]);
        }
        return copy;
    }
    //throw new Error("Unable to copy obj! Its type isn't supported.");
    __Error.log(2,"Util.clone : Unable to copy obj! Its type isn't supported.");
}
__Util.token = function (length) {
  	var $i = 0,
      	$length = length||32,
      	$yu = Array(0,1,2,3,4,5,6,7,8,9,"a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"),
      	$utk = "";
  	for($i = 0;$i<$length;$i++) {
    	var $j = __Math.rand(0,61);
   		$utk+= $yu[$j];
  	}
  	return $utk;
}
__Util.base64={
	EncodeChars:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
	DecodeChars:new Array(
     	-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
     	-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
     	-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
     	52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
     	-1, 0,   1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
     	15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
     	-1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
     	41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1),
	decode: function (str) {
     	var c1, c2, c3, c4,
	     	i = 0, 
	     	len = str.length, 
	     	out = "";
     	while(i < len) {
         	// c1 
         	do {
             	c1  =  __Util.base64.DecodeChars[str.charCodeAt(i++) & 0xff];
         	} while(i < len && c1  ==  -1);
         	if(c1  ==  -1){
         		break;
         	}
	        // c2
	        do {
	             c2  =  __Util.base64.DecodeChars[str.charCodeAt(i++) & 0xff];
	        } while(i < len && c2  ==  -1);
	        if(c2  ==  -1){
	            break;
	        }
	        out +=  String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
	        // c3
	        do {
	            c3  =  str.charCodeAt(i++) & 0xff;
	            if(c3  ==  61){
	            	return out
	            }
	            c3  =  __Util.base64.DecodeChars[c3];
	        } while(i < len && c3  ==  -1);
	        if(c3  ==  -1){
	            break;
	        }
        	out +=  String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

	        // c4
	        do {
	            c4  =  str.charCodeAt(i++) & 0xff;
	            if(c4  ==  61){
	            	return out;
	            } 
	            c4  =  __Util.base64.DecodeChars[c4];
	        } while(i < len && c4  ==  -1);
	        if(c4  ==  -1){
	            break;
	        }
	        out +=  String.fromCharCode(((c3 & 0x03) << 6) | c4);
     	}
     	return out;
	},
	encode:function (str) {
     	var c1, c2, c3,
	     	i = 0, 
	     	len = str.length, 
	     	out = "";
     	while(i < len) {
         	c1  =  str.charCodeAt(i++) & 0xff;
         	if(i  ==  len){
             	out +=  __Util.base64.EncodeChars.charAt(c1 >> 2);
             	out +=  __Util.base64.EncodeChars.charAt((c1 & 0x3) << 4);
             	out +=  " == ";
             	break;
         	}
         	c2  =  str.charCodeAt(i++);
         	if(i  ==  len){
             	out +=  __Util.base64.EncodeChars.charAt(c1 >> 2);
             	out +=  __Util.base64.EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
            	out +=  __Util.base64.EncodeChars.charAt((c2 & 0xF) << 2);
             	out +=  " = ";
             	break;
         	}
         	c3  =  str.charCodeAt(i++);
         	out +=  __Util.base64.EncodeChars.charAt(c1 >> 2);
         	out +=  __Util.base64.EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
        	out +=  __Util.base64.EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));
         	out +=  __Util.base64.EncodeChars.charAt(c3 & 0x3F);
     	}
     	return out;
	},
	utf8to16:function (str) {
     	var c,char2, char3,
	     	i = 0, 
	     	len = str.length, 
	     	out = "";
    	while(i < len) {
         	c  =  str.charCodeAt(i++);
         	switch(c >> 4){ 
           		case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
             		// 0xxxxxxx
             		out +=  str.charAt(i-1);
             		break;
           		case 12: case 13:
             		// 110x xxxx    10xx xxxx
             		char2  =  str.charCodeAt(i++);
             		out +=  String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
             		break;
           		case 14:
             		// 1110 xxxx   10xx xxxx   10xx xxxx
             		char2  =  str.charCodeAt(i++);
             		char3  =  str.charCodeAt(i++);
             		out += String.fromCharCode(((c & 0x0F) << 12) |
                                            ((char2 & 0x3F) << 6) |
                                            ((char3 & 0x3F) << 0));
             		break;
         	}
     	}
     	return out;
	},
	utf16to8:function (str) {
    	var i, c,
     	 	len=str.length,
     	 	out =  "";
     	for(i  =  0; i < len; i++) {
         	c  =  str.charCodeAt(i);
         	if ((c >=  0x0001) && (c <=  0x007F)) {
             	out +=  str.charAt(i);
         	} else if (c > 0x07FF) {
             	out +=  String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
             	out +=  String.fromCharCode(0x80 | ((c >>   6) & 0x3F));
             	out +=  String.fromCharCode(0x80 | ((c >>   0) & 0x3F));
         	} else {
             	out +=  String.fromCharCode(0xC0 | ((c >>   6) & 0x1F));
             	out +=  String.fromCharCode(0x80 | ((c >>   0) & 0x3F));
         	}
     	}
     	return out;
	}
}
//short cuts
var _title = SYSLIB.namespace("syslib.util").title,
	_pushhistory = SYSLIB.namespace("syslib.util").brhistory,
	_seturl = SYSLIB.namespace("syslib.util").url,
    _clone = SYSLIB.namespace("syslib.utils").clone;

