   
var jpostdb = jpostdb || {
    version: "0.0.12",
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

    fetchReq: function(method, url, arg, renderDiv, width, callback){
	console.log(url + " " + arg);
	var [gid, svg] = jpostdb.loading.append(renderDiv, width / 2);
	var loadingTimer = setInterval(function(){jpostdb.loading.anime(svg, gid);}, 300);
	var options = {method: method};
        if(method == "get" && arg){
	    url += "?" + arg.join("&"); 
	}else if(method == "post"){
	    options.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
	}
	try{
	    var res = fetch(url, options).then(res=>res.json());
	    res.then(function(json){
		jpostdb.loading.remove(svg);
		callback(json, renderDiv); 
		clearInterval(loadingTimer);
	    });
	}catch(error){
	    console.log(error);
	    clearInterval(loadingTimer);
	    jpostdb.loading.error(svg, gid, width / 2);
	}
    },

    loading: {
	frame: 0,
	next: 0,
	count: function(){
	    this.frame++;
	    if(this.frame == 6) this.frame = 0;
	},
	append: function(renderDiv, center){
	    var gid = "l" + Math.floor(Math.random() * 10000 + 1);
	    var data = [{x: center - 40, c: 1}, {x: center - 20, c: 2}, {x: center, c: 3}, {x: center + 20, c: 4}];
	    var svg = renderDiv.append('svg');
	    svg.transition().duration(100).attr("height", 50).attr("width", center * 2)
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
		.attr("cy", 30).attr("r", 0);
	    return [gid, svg];
	},
	anime: function(svg, gid){
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
		    .attr("cy", 18)
		    .transition()
		    .duration(120)
		    .attr("cy", 35);
	    }else{
		g.selectAll("circle")
		    .transition()
		    .duration(240)
		    .attr("r", 0);
	    }
	},
	remove: function(svg){
	    svg.remove();
	},
	error: function(svg, gid, center){
	    var g = svg.select("#l" + gid);
	    g.remove();
	    var g = svg.select("#" + gid);
	    g.append("text")
		.attr("x", center)
		.attr("y", 30)
		.attr("text-anchor", "middle")
		.text("error");
	    var g = g.append("g")
		.attr("class", "del_button protein_browser_label_set")
		.style("cursor", "pointer")
	    	.on("click", function(){ jpostdb.loading.remove(svg); });
	    g.append("rect")
		.attr("x", center + 20)
		.attr("y", 20)
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
		.attr("d", "M " + (center + 22) + " 20 L " + (center + 33) + " 33");
	    g.append("path")
		.attr("stroke-width", "3px")
		.attr("stroke", "#c6c6c6")
		.attr("d", "M " + (center + 33) + " 20 L " + (center + 22) + " 33");
	   
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
