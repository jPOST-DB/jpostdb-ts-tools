   
var jpostdb = jpostdb || {
    version: "0.0.11",
    root: "http://tools.jpostdb.org/",
    dev_root: "/db-main/",
    api: "http://tools.jpostdb.org/rest/api/",
    subApi: "http://tools.jpostdb.org/api/",
    endpoint: "http://tools.jpostdb.org/proxy/sparql/",
    initFrag: false,
    debug: false,

    init: function(){
	jpostdb.windowWidth = window.innerWidth;
    },
    
    httpReq: function(method, url, arg, callback, svg, renderDiv, x, y){
	console.log(url + " " + arg);
	var gid = jpostdb.loading.append(svg, x, y);
	var loadingTimer = setInterval(function(){jpostdb.loading.anime(svg, gid, y);}, 300);
	var httpObj = new XMLHttpRequest();
        httpObj.open(method, url, true);
	if(method == "post") httpObj.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
        httpObj.onreadystatechange = function() {
            var READYSTATE_COMPLETED = 4;
            var HTTP_STATUS_OK = 200;
            if(this.readyState == READYSTATE_COMPLETED && this.status == HTTP_STATUS_OK){
                var json = JSON.parse(httpObj.responseText);
		jpostdb.loading.remove(svg, gid);
		callback(json, renderDiv); 
		clearInterval(loadingTimer);
	    }else if(this.readyState == READYSTATE_COMPLETED){
		clearInterval(loadingTimer);
		jpostdb.loading.error(svg, gid, x, y);
	    }
	}
	httpObj.send(arg);
    },

    loading: {
	frame: 0,
	next: 0,
	count: function(){
	    this.frame++;
	    if(this.frame == 6) this.frame = 0;
	},
	append: function(svg, x, y){
	    var gid = "l" + Math.floor(Math.random() * 10000 + 1);
	    var data = [{x: x - 40, c: 1}, {x: x - 20, c: 2}, {x: x, c: 3}, {x: x + 20, c: 4}];
	    svg.transition().duration(100).attr("height", y + 50);
	    var g = svg.append("g")
		.attr("id", gid)
		.append("g")
		.attr("id", "l" + gid);
	    g.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("fill", "#c6c6c6")
		.attr("id", function(d){ return gid + "_" + d.c; })
		.attr("cx", function(d){ return d.x; })
		.attr("cy", y + 30).attr("r", 0);
	    return gid;
	},
	anime: function(svg, gid, y){
	    var f = this.frame;
	    var g = svg.select("#" + gid);
	    if(f == 0){
		g.selectAll("circle")
		    .transition()
		    .duration(240)
		    .attr("r", 8)	
	    }else if(f <= 4){
		g.select("#" + gid + "_" + f)
		    .transition()
		    .duration(120)
		    .attr("cy", y + 18)
		    .transition()
		    .duration(120)
		    .attr("cy", y + 35);
	    }else{
		g.selectAll("circle")
		    .transition()
		    .duration(240)
		    .attr("r", 0);
	    }
	},
	remove: function(svg, gid, y){
	    var g = svg.select("#" + gid);
	    g.remove();
	},
	error: function(svg, gid, x, y){
	    var g = svg.select("#l" + gid);
	    g.remove();
	    var g = svg.select("#" + gid);
	    g.append("text")
		.attr("x", x)
		.attr("y", y + 30)
		.attr("text-anchor", "middle")
		.text("error");
	    var g = g.append("g")
		.attr("class", "del_button protein_browser_label_set")
		.style("cursor", "pointer")
	    	.on("click", function(){ jpostdb.loading.remove(svg, gid); });
	    g.append("rect")
		.attr("x", x + 20)
		.attr("y", y + 20)
		.attr("width", 15)
		.attr("height", 15)
		.attr("rx", 3)
		.attr("ry", 3)
		.attr("fill", "#ffffff")
		.attr("stroke-width", "2px")
		.attr("stroke", "#c6c6c6");
	    g.append("path")
		.attr("stroke-width", "3px")
		.attr("stroke", "#c6c6c6")
		.attr("d", "M " + (x + 22) + " " + (y + 20) + " L " + (x + 33) + " " + (y + 33));
	    g.append("path")
		.attr("stroke-width", "3px")
		.attr("stroke", "#c6c6c6")
		.attr("d", "M " + (x + 33) + " " + (y + 20) + " L " + (x + 22) + " " + (y + 33));
	   
	}
    },

    init_param: function(param, stanza_params, stanza, renderDiv){
	// set width
	param.renderDiv = stanza.select(renderDiv);
	param.width = param.renderDiv.offsetWidth;
	if(param.width <= 300) param.width = jpostdb.windowWidth - 200;
	if(param.width <= 300) param.width = 960;
	//set stanza args
	param.apiArg = [];
	for(var key in stanza_params){
	    if(stanza_params[key]) param.apiArg.push(key + "=" + encodeURIComponent(stanza_params[key]));
	}
	return param;
    },

    def_color0: [ "#a8a8e0", "#a8e0e0", "#a8e0a8", "#e0e0a8", "#e0a8c0", "#c0a8e0", "#a8c0e0", "#a8e0c0", "#c0e0a8", "#e0c0a8", "#e0a8a8", "#e0a8e0"], // pastel
    def_color1: [ "#ebde37", "#eccf31", "#edc12c", "#eeb326", "#efa521", "#f0971b", "#f18916", "#f27b10", "#f36d0b", "#f45f05", "#f55100"], // yellow-orange
    def_color2: [ "#66ccff", "#6666ff", "#cc66ff", "#ff66cc", "#ff6666", "#ffcc66", "#99ff66", "#66ff99", "#66ffff", "#6699ff", "#9966ff", "#ff66ff", "#ff6699", "#ff9966", "#ccff66", "#66ff66", "#66ffcc", "#6699cc", "#9966cc", "#cc6699", "#cc9966", "#99cc66", "#66cc99", "#66cccc", "#6666cc", "#cc66cc", "#cc6666", "#cccc66", "#66cc66", "#9999ff", "#ff99ff", "#ff9999", "#ccff99", "#99ffcc", "#99ccff", "#cc99ff", "#ff99cc", "#ffcc99", "#99ff99", "#99ffff"]
};

if(jpostdb.initFrag == false){
    jpostdb.initFrag = true;
    jpostdb.init();
    setInterval(function(){jpostdb.loading.count();}, 300);
}
