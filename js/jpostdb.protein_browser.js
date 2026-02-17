// jPOST-db Protein brower

jpostdb.protein_browser = jpostdb.protein_browser || {
    
    param: {
	seqLen: 0,
	width: 0,
	height: 0,
	margin: 20,
	marginLeft: 20,
	marginTop: 20,
	marginRight: 20,
	freqHeight: 100,
	top: 0,
	scale: 1,
	start: 1,
	lineHeight: 16,
	freqLineY: 0,
	mouseX: 0,
	mouseY: 0,
	dragMouseX: 0,
	dragStartX: 0,
	dragFlag: false,
	anime: 100,
	animeFreq: 200
    },

    init: function(stanza_params, stanza, renderDiv){
	var group = jpostdb.protein_browser;
	var param = group.param;
	param = jpostdb.init_param(param, stanza_params, stanza, renderDiv);
	
	var renderDiv = d3.select(param.renderDiv);
	var view = renderDiv.append("div").attr("class", "view").attr("id", "protein_browser");
	var svg = view.append("svg")
	    .attr("id", "protein_browser_svg")
	    .attr("width", param.width)
	    .attr("height", param.height);

	var url = jpostdb.api + "protein_browser_init?" + param.apiArg.join("&");
//	jpostdb.httpReq("get", url, null, group.make_select, svg, renderDiv, param.width / 2, param.top);
	jpostdb.fetchReq("post", url, null, renderDiv, param.width,  group.make_select);
    },

    make_select: function(json, renderDiv){
	var group = jpostdb.protein_browser;
	var param = group.param;

	param.seqArea = param.width - param.marginLeft - param.marginRight;
	param.seq = json.seq;
	param.seqLen = json.seq.length;
	param.maxScale = Math.round(param.seqLen / param.seqArea * 10 * 100) / 100;
	
	var view = renderDiv.select("#protein_browser");
	var svg = renderDiv.select("#protein_browser_svg");
	var labelFlag = 0;
	var labelSwitch= function(){
	    if(labelFlag){
		labelFlag = 0;
		ctrl.select("#show_label").attr("fill", "#eecccc");
		ctrl.select("#hide_label").attr("fill", "#c6c6c6");
		svg.selectAll(".protein_browser_label_set").attr("display", "block");
	    }else{
		labelFlag = 1;
		ctrl.select("#show_label").attr("fill", "#c6c6c6");
		ctrl.select("#hide_label").attr("fill", "#eecccc");
		svg.selectAll(".protein_browser_label_set").attr("display", "none");
	    }
	}

	// label ctrl
	var ctrl = view.append("svg")
	    .attr("id", "protein_browser_ctrl")
	    .attr("width", param.width)
	    .attr("height", 20);
	var box = ctrl.append("g").attr("transform", "translate(" + param.marginLeft + ",0)");
	box.append("text")
	    .attr("x", 0)
	    .attr("y", 12)
	    .attr("fill", "#888888")
	    .text("Label:");
	var b = box.append("g")
	    .attr("class", "button")
	    .style("cursor", "pointer")
	    .on("click", function(){if(labelFlag == 1){labelSwitch();}});
	b.append("rect")
	    .attr("y", 0)
	    .attr("x", 50)
	    .attr("width", 50)
	    .attr("height", 16)
	    .attr("rx", 5)
	    .attr("ry", 5)
	    .attr("id", "show_label")
	    .attr("fill", "#eecccc");
	b.append("text")
	    .attr("y", 12)
	    .attr("x", 75)
	    .attr("fill", "#ffffff")
	    .attr("text-anchor", "middle")
	    .text("show");
	var b = box.append("g")
	    .attr("class", "button")
	    .style("cursor", "pointer")
	    .on("click", function(){if(labelFlag == 0){labelSwitch();}});
	b.append("rect")
	    .attr("y", 0)
	    .attr("x", 110)
	    .attr("width", 50)
	    .attr("height", 16)
	    .attr("rx", 5)
	    .attr("ry", 5)
	    .attr("id", "hide_label")
	    .attr("fill", "#c6c6c6");
	b.append("text")
	    .attr("y", 12)
	    .attr("x", 135)
	    .attr("fill", "#ffffff")
	    .attr("text-anchor", "middle")
	    .text("hide");

	var form = renderDiv.append("div").attr("id", "protein_browser_form")
	    .style("margin-left", "20px");
	
	var select = form.append("select")
	    .attr("id", "view_select")
	    .attr("class", "protein_browser_select")
	    .on("change", function(d){
		var id = this.value;
		if(!id.match(/^--/)){	    
		    form.select("#sel_list_" + id).attr("disabled", true);
		    form.select("#sel_list_def").attr("selected", null).attr("selected", true);
		    var unimod = "";
		    if(id.match(/^ptm_position_\d+$/)){ unimod = id.match(/^ptm_position_(\d+)$/)[1]; id = "ptm_position"; }
		    var apiName = "protein_" + id;
		    var func = group[id];
		    var url = jpostdb.api + apiName + "?" + param.apiArg.join("&");
		    if(unimod) url += "&unimod=" + unimod;
		 //   jpostdb.httpReq("get", url, null, func, svg, renderDiv, param.seqArea / 2, param.top);
		    jpostdb.fetchReq("get", url, null, renderDiv, param.seqArea, func);
		}
	    });
	select.append("option")
	    .attr("id", "sel_list_def")
	    .text("-- Add view --");
	select.append("option")
	    .attr("class", "sel_list")
	    .attr("id", "sel_list_psm_align")
	    .attr("value", "psm_align")
	    .attr("disabled", true)
	    .text("Peptide alignment");
	select.selectAll(".ptm_list")
	    .data(json.ptm_list)
	    .enter()
	    .append("option")
	    .attr("class", "ptm_list")
	    .attr("id", function(d){ return "sel_list_ptm_position_" + d.mod.value.match(/UNIMOD_(\d+)$/)[1]; })
	    .attr("value", function(d){ return "ptm_position_" + d.mod.value.match(/UNIMOD_(\d+)$/)[1]; })
	    .text(function(d){ return d.mod_label.value + " site"; });
	if(json.p_link){
	    select.append("option")
		.attr("class", "sel_list")
		.attr("id", "sel_list_ptm_linkage")
		.attr("value", "ptm_linkage")
		.text("P-site linkage");
	}
	if(json.up_info){
	    select.append("option")
		.attr("class", "sel_list")
		.attr("id", "sel_list_known_ptm")
		.attr("value", "known_ptm")
		.text("UniProt annotation");
	}
	
	var xAxis = [];
	var xAxiSub = [];
	var aaPos = [];
	
	var setData = function(){	    
	    //x-axis
	    xAxis = [];
	    var i = 0;
	    var interval = 100;
	    while( i * interval < param.seqLen){
		var obj = {};
		var x = (i * interval - param.start + 1) * param.seqArea / param.seqLen * param.scale;
		obj.l = i * interval;
		obj.d = "none";
		if(x >= 0 && x <= param.seqArea){
		    obj.x = Math.round(x * 1000) / 1000 + param.marginLeft;
		    obj.d = "block";
		}else if(x < 0){
		    obj.x = param.marginLeft;
		}else if(x > param.seqArea){
		    obj.x = param.seqArea + param.marginLeft;
		}
		xAxis.push(obj);
		i++;
	    }
	    xAxisSub = [];
	    var i = 0;
	    var interval = 100;
	    while( i * interval < parseInt(param.seqLen)){
		var obj = {};
		var x = (i * interval - param.start + 1 + 50) * param.seqArea / param.seqLen * param.scale;
		obj.l = i * interval + 50;
		obj.d = "none";
		if(x >= 0 && x <= param.seqArea){
		    obj.x = Math.round(x * 1000) / 1000 + param.marginLeft;
		    if(param.seqLen / param.scale < 250) obj.d = "block";
		}else if(x < 0){
		    obj.x = param.marginLeft;
		}else if(x > param.seqArea){
		    obj.x = param.seqArea + param.marginLeft;
		}
		xAxis.push(obj);
		i++;
	    }
	    
	    // x-axis back
	    xAxisBack = [];
	    for(var i = -1; i < param.seqArea / 200 + 1; i++){  // leter=10 * window=10 * (white+glay=2);
		xAxisBack[i+1] = {};
		var sx = ((i * 20) - (param.start % 20) + 1) * param.seqArea / param.seqLen * param.scale;
		var ex = ((i * 20) - (param.start % 20) + 11) * param.seqArea / param.seqLen * param.scale;
		if(sx >= 0 && sx <= param.seqArea){
		    xAxisBack[i+1].sx = Math.round(sx * 1000) / 1000 + param.marginLeft;
		}else if(sx < 0){
		    xAxisBack[i+1].sx = param.marginLeft;
		}else if(sx > param.seqArea){
		    xAxisBack[i+1].sx = param.seqArea + param.marginLeft;
		}
		if(ex >= 0 && ex <= param.seqArea){
		    xAxisBack[i+1].ex = Math.round(ex * 1000) / 1000 + param.marginLeft;
		}else if(ex < 0){
		    xAxisBack[i+1].ex = param.marginLeft;
		}else if(ex > param.seqArea){
		    xAxisBack[i+1].ex = param.seqArea + param.marginLeft;
		}
	    }

	    // seq & aa
	    if(param.scale == param.maxScale){ //console.log(param.start + " " + (param.start + param.seqArea / 10));
		aaPos = param.start * (-10) + 10 + param.marginLeft;
	    }
	};

	var plot = function(){
	    // x-axis
	    svg.select("g#axis").selectAll(".x_axis")
		.data(xAxis)
		.attr("d", function(d){ return "M " + d.x + " 0 V 10";})
		.attr("display", function(d){ return d.d; });
	    svg.select("g#axis").selectAll(".x_axis_text")
		.data(xAxis)
		.attr("x", function(d){ return  d.x - 5 ;})
		.attr("display", function(d){ return d.d; });
	    svg.select("g#axis").selectAll(".x_axis_s")
		.data(xAxisSub)
		.attr("d", function(d){ return "M " + d.x + 50 + " 0 V 10";})
		.attr("display", function(d){ return d.d; });
	    svg.select("g#axis").selectAll(".x_axis_text_s")
		.data(xAxisSub)
		.attr("x", function(d){ return  d.x + 50 - 5 ;})
		.attr("display", function(d){ return d.d; });
	    
	    // seq & aa & back
	    if(param.scale == param.maxScale){
		svg.selectAll("text.aaseq")
		    .attr("x", aaPos)
		    .attr("display", "block");
		svg.selectAll("rect.x_axis_back")
		    .data(xAxisBack)
		    .attr("x", function(d){ return d.sx;})
		    .attr("width", function(d){ return d.ex - d.sx;})
		    .attr("display", "block");
	    }else{
		svg.selectAll("text.aaseq")
		    .attr("display", "none");
		svg.selectAll("rect.x_axis_back")
		    .attr("display", "none");
	    }
	};
	
	var render = function(){   
	    // x-axis
	    param.top += param.marginTop;
	    var g = svg.append("g")
		.attr("transform", "translate(0," + param.top + ")")
		.attr("id", "axis");
	    g.selectAll(".x_axis_back")
		.data(xAxisBack)
		.enter()
		.append("rect")
		.attr("class", "x_axis_back")
		.attr("fill", "#eeeeee")
		.attr("y", 0)
		.attr("display", "none");
	    g.append("path")
		.attr("stroke", "#000000")
		.attr("fill", "none")
		.attr("stroke-width", "1px")
		.attr("d", "M " + param.marginLeft + " 10  H " + (param.seqArea + param.marginLeft));
	    g.selectAll(".x_axis")
		.data(xAxis)
		.enter()
		.append("path")
		.attr("stroke", "#000000")
		.attr("fill", "none")
		.attr("stroke-width", "1px")
		.attr("class", "x_axis")
		.attr("d", function(d){ return "M " + d.x + " 0 V 10";});
	    g.selectAll(".x_axis_text")
		.data(xAxis)
		.enter()
		.append("text")
		.attr("class", "x_axis_text")
		.attr("text-anchor", "end")
		.attr("font-size", 12)
		.attr("x", function(d){ return  d.x - 5 ;})
		.attr("y", 0)
		.text(function(d){ return d.l;});
	    g.selectAll(".x_axis_s")
		.data(xAxisSub)
		.enter()
		.append("path")
		.attr("stroke", "#000000")
		.attr("fill", "none")
		.attr("stroke-width", "1px")
		.attr("class", "x_axis_s")
		.attr("d", function(d){ return "M " + d.x + " 0 V 10";})
		.attr("display", "none");
	    g.selectAll(".x_axis_text")
		.data(xAxisSub)
		.enter()
		.append("text")
		.attr("class", "x_axis_text_s")
		.attr("text-anchor", "end")
		.attr("font-size", 12)
		.attr("x", function(d){ return  d.x - 5 ;})
		.attr("y", 0)
		.attr("display", "none")
		.text(function(d){ return d.l;});
	    
	    // seq
	    param.top += 20 + param.lineHeight / 2;
	    var g = svg.append("g")
		.attr("transform", "translate(0," + param.top + ")")
		.attr("calss", "seq");
	    g.append("path")	
		.attr("stroke", "#0066dd")
		.attr("fill", "none")
		.attr("stroke-width", param.lineHeight + "px")
		.attr("d", "M " + param.marginLeft + " 0 H " + (param.seqArea + param.marginLeft));
	    g.append("text")
		.attr("fill", "#ffffff")
		.attr("class", "aaseq protein_browser_mono")
		.attr("y", 5)
		.attr("display", "none")
		.attr("textLength", param.seqLen * 10)
		.attr("lengthAdjust", "spacingAndGlyphs")
		.text(param.seq);
	    
	    param.top += param.lineHeight/2 + param.margin;
	    svg.attr("height", param.top);
	};

	setData();
	render();
	plot();
	
	group.mouseEventCheck(svg);
	group.mouseEvent(svg, setData, plot);

	var url = jpostdb.api + "protein_psm_align?" + param.apiArg.join("&");
//	jpostdb.httpReq("get", url, null, group.psm_align, svg, renderDiv, param.seqArea / 2, param.top);
	jpostdb.fetchReq("get", url, null, renderDiv, param.seqArea, group.psm_align);
    },

    x_axis_bg_height: function(renderDiv){
	var group = jpostdb.protein_browser;
	var param = group.param;
	var svg = renderDiv.select("#protein_browser_svg");
	
	svg.selectAll("rect.x_axis_back")
	    .transition()
	    .duration(param.anime)
	    .attr("height", param.top - param.marginTop - param.margin);
    },

    psm_align: function(psm, renderDiv){
	var group = jpostdb.protein_browser;
	var param = group.param;
	var svg = renderDiv.select("#protein_browser_svg");

	maxPsmY = 0;
	for(var i = 0; i < psm.length; i++){
	    if(psm[i].y - 0 > maxPsmY) maxPsmY = psm[i].y - 0;
	}
	
	var setData = function(){
	    // psms
	    for(var i = 0; i < psm.length; i++){
		var sx = (psm[i].begin - param.start) * param.seqArea / param.seqLen * param.scale;
		if(sx >= 0 && sx <= param.seqArea) psm[i].sx = Math.round(sx * 1000) / 1000 + param.marginLeft;
		else if(sx < 0) psm[i].sx = param.marginLeft;
		else if(sx > param.seqArea) psm[i].sx = param.seqArea + param.marginLeft;
		
		var ex = (psm[i].end - param.start + 1) * param.seqArea / param.seqLen * param.scale;
		if(ex >= 0 && ex <= param.seqArea) psm[i].ex = Math.round(ex * 1000) / 1000 + param.marginLeft;
		else if(ex < 0) psm[i].ex = param.marginLeft;
		else if(ex > param.seqArea) psm[i].ex = param.seqArea + param.marginLeft;
	    }
	}
	
	var plot = function(){	    
	    // psms
	    svg.select("g#psm_align").selectAll(".seq")
		.data(psm)
		.attr("d", function(d){ return "M " + d.sx + " " + d.y + " H " + d.ex; });
	    svg.select("g#psm_align").selectAll(".seq_txt")
		.data(psm)
		.attr("x", function(d){ return d.sx; });
	}
	

	var render = function(){
	    // psms
	    for(var i = 0; i < psm.length; i++){
		psm[i].y = psm[i].y * param.lineHeight - param.lineHeight/2;
	    }
	    var g = svg.append("g")
		.attr("class", "psms view_unit")
		.attr("transform", "translate(0," + param.top + ")")
		.attr("id", "psm_align");
	    var label = g.append("g").attr("class", "protein_browser_label_set");
	    label.append("text")
		.attr("y", 40)
		.attr("x", 20)
		.attr("fill", "#ddccdd")
		.attr("class", "protein_browser_label")
		.text("Peptide");	    
	    g.selectAll(".seq")
		.data(psm)
		.enter()
		.append("a")
		.attr("xlink:href", function(d){ return jpostdb.dev_root + "?peptide=" + d.pep_id; })
		.append("path")
		.attr("class", "seq")
		.attr("stroke", function(d){ return d.color;})
		.attr("fill", "none")
		.attr("stroke-width", "10px")
		.attr("d", function(d){ return "M " + d.sx + " " + d.y + " H " + d.ex; })
		.on("mouseover", function(d){ svg.select('#' +  d.label.replace(/[^\w\_]/g, "_")).attr("display", "block"); })
		.on("mouseout", function(d){ svg.select('#' +  d.label.replace(/[^\w\_]/g, "_")).attr("display", "none"); })
	    g.selectAll(".seq_txt")
		.data(psm)
		.enter()
		.append("text")
		.attr("class", "seq_txt protein_browser_mono")
		.attr("id", function(d){ return d.label.replace(/[^\w\_]/g, "_"); })
    		.attr("textLength",  function(d){ return d.label.length * 10;})
		.attr("lengthAdjust", "spacingAndGlyphs")
		.attr("x", function(d){ return d.sx; })
		.attr("y", -3)
		.attr("display", "none")
		.text(function(d){return d.label});

	    var h = (maxPsmY + 1) * param.lineHeight + param.margin;
	    group.delUnit.mkButton(renderDiv, "psm_align", h);
	    param.top += h;
	    svg.transition().duration(param.anime).attr("height", param.top);
	    console.log(document.body.parentNode.parentNode.parentNode);
	    group.x_axis_bg_height(renderDiv);
	}
	
	setData();
	render();
	plot();
	
	group.mouseEvent(svg, setData, plot);

    },

    // known ptm (uniprot)
    known_ptm: function(data, renderDiv){
	var group = jpostdb.protein_browser;
	var param = group.param;
	var svg = renderDiv.select("#protein_browser_svg");

	maxY = 0;
	for(var i = 0; i < data.length; i++){ if(data[i].y - 0 > maxY) maxY = data[i].y - 0; }
	
	var setData = function(){
	    // ptms
	    for(var i = 0; i < data.length; i++){
		var x = (data[i].position - param.start) * param.seqArea / param.seqLen * param.scale + 5; // font-size/2
		if(x >= 0 && x <= param.seqArea){
		    data[i].x = Math.round(x * 1000) / 1000 + param.marginLeft;
		    data[i].d = "block";
		}else if(x < 0){
		    data[i].x = param.marginLeft;
		    data[i].d = "none";
		}else if(x > param.seqArea){
		    data[i].x = param.seqArea + param.marginLeft;
		    data[i].d = "none";
		}
		var r = param.scale / param.maxScale * 5 * 1.5;
		if(r < 2){ data[i].r = 2;}
		else if(r > 5){ data[i].r = 5;}
		else{ data[i].r = Math.round(r * 1000) / 1000;}
	    }
	}
	
	var plot = function(){ 
	    // ptms
	    
	    svg.select("g#known_ptm").selectAll(".ptm_bar")
		.data(data)
	    	.attr("display", function(d){ return d.d;})
	    	.attr("d", function(d){ return "M " + d.x + " " + ((maxY * 2 + 1) * param.lineHeight) + " V " + (d.y * 2 * param.lineHeight);});
	    svg.select("g#known_ptm").selectAll(".ptm")
		.data(data)
		.attr("display", function(d){ return d.d;})
		.attr("cx", function(d){ return d.x; })
		.attr("rx", function(d){ return d.r; });
	    svg.select("g#known_ptm").selectAll(".ptm_site")
		.data(data)
	    	.attr("display", function(d){
		    if(d.d == "block" && param.scale == param.maxScale) return "block";
		    else return "none" ;})
		.attr("x", function(d){ return d.x; });
	    svg.select("g#known_ptm").selectAll(".ptm_txt")
		.data(data)
		.attr("x", function(d){ return d.x + 10; });
	}
	
	var render = function(){
	    // ptms 
	    var g = svg.append("g")
		.attr("class", "def view_unit")
		.attr("transform", "translate(0," + param.top + ")")
		.attr("id", "known_ptm");
	    var label = g.append("g").attr("class", "protein_browser_label_set");
	    label.append("text")
		.attr("y", 40)
		.attr("x", param.marginLeft)
		.attr("fill", "#ddccdd")
		.attr("class", "protein_browser_label")
		.text("UniProt annotation");

	    g.selectAll(".ptm_bar")
		.data(data)
		.enter()
		.append("path")
		.attr("class", "ptm_bar")
		.attr("d", function(d){ return "M " + d.x + " " + ((maxY * 2 + 1) * param.lineHeight) + " V " + (d.y * 2 * param.lineHeight);})
		.attr("fill", "none")
		.attr("stroke", "#888888");

	    var g2 = g.selectAll(".ptm_g")
		.data(data)
		.enter()
		.append("g")
		.attr("class", "ptm_g")
	    	.style("cursor", "pointer")
	    	.on("mouseover", function(d){ svg.select('#' +  d.site + d.position + "_uniprot_txt").attr("display", "block"); })
		.on("mouseout", function(d){ svg.select('#' +  d.site + d.position + "_uniprot_txt").attr("display", "none"); });
	    g2.append("ellipse")
		.attr("class", "ptm")
		.attr("fill", function(d){ return d.color; })
		.attr("cx", function(d){ return d.x; })
		.attr("cy", function(d){ return (d.y * 2 - 0.5) * param.lineHeight;} )
		.attr("rx", function(d){ return d.r; })
		.attr("ry", param.lineHeight / 2);
	    var display = "none";
	    if(param.scale == param.maxScale) display = "block";
	    g2.append("text")
		.attr("class", "ptm_site protein_browser_mono")
	    	.attr("textLength", 10)
		.attr("lengthAdjust", "spacingAndGlyphs")
		.attr("text-anchor", "middle")
		.attr("id", function(d){return d.site + d.position + "_uniprot"; })
		.attr("x", function(d){ return d.x - 5; })
		.attr("y", function(d){ return d.y * 2 * param.lineHeight - 3; })
		.attr("fill", "#000000")
		.attr("display", display)
		.text(function(d){return d.symbol; });
	    g.selectAll(".ptm_txt")
		.data(data)
		.enter()
		.append("text")
		.attr("class", "ptm_txt protein_browser_mono")
		.attr("id", function(d){return d.site + d.position + "_uniprot_txt"; })
		.attr("x", function(d){ return d.x; })
		.attr("y", function(d){ return (d.y * 2 - 1) * param.lineHeight; })
		.attr("display", "none")
		.text(function(d){return d.site + d.position + " " + d.label});

	    g.append("path")
		.attr("stroke", "#c6c6c6")
		.attr("fill", "none")
		.attr("stroke-width", param.lineHeight + "px")
		.attr("d", "M " + (param.marginLeft + 1) + " " + (((maxY + 1) * 2 - 0.5) * param.lineHeight) + " H " + (param.seqArea + param.marginLeft));
	    var display = "none";
	    if(param.scale == param.maxScale) display = "block";
	    g.append("text")
		.attr("fill", "#ffffff")
		.attr("class", "aaseq protein_browser_mono")
		.attr("y",  ((maxY + 1) * 2 - 0.5) * param.lineHeight + 5)
		.attr("display", display)
		.attr("textLength", param.seqLen * 10)
		.attr("lengthAdjust", "spacingAndGlyphs")
		.text(param.seq);
	    
	    var h = (maxY + 1) * 2 * param.lineHeight + param.margin;
	    group.delUnit.mkButton(renderDiv, "known_ptm", h);
	    param.top += h;
	    svg.transition().duration(param.anime).attr("height", param.top);
	    group.x_axis_bg_height(renderDiv);
	}
	
	setData();
	render();
	plot();

	group.mouseEvent(svg, setData, plot);
    },
	    
    ptm_position: function(ptm, renderDiv){
	var group = jpostdb.protein_browser;
	var param = group.param;
	var svg = renderDiv.select("#protein_browser_svg");
	
	var ptmSwitch = 0;  
	var plotGraphAnime = function() {
	    // ptms
	    svg.select("g#ptm_position_" + ptm.mod_id).selectAll(".freq")
		.data(ptm.list)
		.transition()
		.duration(param.animeFreq)
		.attr("d", function(d){if(ptmSwitch){ return "M " + d.x + " " + d.count_stroke; }else{return "M " + d.x + " " + d.norm_stroke;}});
	    svg.select("g#ptm_position_" + ptm.mod_id).selectAll(".ptm_onmouse")
		.data(ptm.list)
		.attr("d", function(d){if(ptmSwitch){ return "M " + d.x + " " + d.count_stroke; }else{return "M " + d.x + " " + d.norm_stroke;}});
	}

	var ptmGraphSwitch= function(name){
	    if(ptmSwitch){
		ptmSwitch = 0;
		svg.select("#norm_" + name).attr("fill", "#eecccc");
		svg.select("#count_" + name).attr("fill", "#c6c6c6");
	    }else{
		ptmSwitch = 1;
		svg.select("#norm_" + name).attr("fill", "#c6c6c6");
		svg.select("#count_" + name).attr("fill", "#eecccc");
	    }
	    plotGraphAnime();
	}
	
	var setData = function(){
	    // ptms
	    for(var i = 0; i < ptm.list.length; i++){
		var x = (ptm.list[i].position - param.start) * param.seqArea / param.seqLen * param.scale + 5; // font-size/2
		if(x >= 0 && x <= param.seqArea){
		    ptm.list[i].x = Math.round(x * 1000) / 1000 + param.marginLeft;
		    ptm.list[i].d = "block";
		}else if(x < 0){
		    ptm.list[i].x = param.marginLeft;
		    ptm.list[i].d = "none";
		}else if(x > param.seqArea){
		    ptm.list[i].x = param.seqArea + param.marginLeft;
		    ptm.list[i].d = "none";
		}
		var r = param.scale / param.maxScale * 5 * 1.5;
		if(r < 2){ ptm.list[i].r = 2;}
		else if(r > 5){ ptm.list[i].r = 5;}
		else{ ptm.list[i].r = Math.round(r * 1000) / 1000;}
		var w = param.scale / param.maxScale * 8;
		if(w < 2){ ptm.list[i].w = 2;}
		else if(w > 8){ ptm.list[i].w = 8;}
		else{ ptm.list[i].w = Math.round(w * 1000) / 1000;}
	    }
	}
	
	var plot = function(){ 
	    // ptms
	    svg.select("g#ptm_position_" + ptm.mod_id).selectAll(".freq")
		.data(ptm.list)
		.attr("display", function(d){ return d.d;})
		.attr("stroke-width", function(d){ return d.w + "px"; })
		.attr("d", function(d){if(ptmSwitch){ return "M " + d.x + " " + d.count_stroke; }else{return "M " + d.x + " " + d.norm_stroke; }});
	    svg.select("g#ptm_position_" + ptm.mod_id).selectAll(".ptm")
		.data(ptm.list)
		.attr("display", function(d){ return d.d;})
		.attr("cx", function(d){ return d.x; })
		.attr("rx", function(d){ return d.r; });
	    svg.select("g#ptm_position_" + ptm.mod_id).selectAll(".ptm_txt")
		.data(ptm.list)
		.attr("x", function(d){ return d.x + 10; });
	    svg.select("g#ptm_position_" + ptm.mod_id).selectAll(".ptm_onmouse")
		.data(ptm.list)
		.attr("display", function(d){ return d.d;})
		.attr("stroke-width", function(d){ return d.w + "px"; })
		.attr("d", function(d){if(ptmSwitch){ return "M " + d.x + " " + d.count_stroke; }else{return "M " + d.x + " " + d.norm_stroke; }});
	}
	
	var render = function(){
	    // ptms
	    param.freqLineY = param.freqHeight + 5;
	    for(var i = 0; i < ptm.list.length; i++){
		ptm.list[i].count_stroke = (param.freqLineY + param.lineHeight / 2) + " V " + (param.freqLineY - (param.lineHeight / 2) - ptm.list[i].count * param.freqHeight / ptm.max_count);
		ptm.list[i].norm_stroke = (param.freqLineY + param.lineHeight / 2) + " V " + (param.freqLineY - (param.lineHeight / 2) - ptm.list[i].count * param.freqHeight / ptm.list[i].position_count);
	    }
	    
	    var g = svg.append("g")
		.attr("class", "ptms view_unit")
		.attr("transform", "translate(0," + param.top + ")")
		.attr("id", "ptm_position_" + ptm.mod_id);
	    var label = g.append("g").attr("class", "protein_browser_label_set");
	    label.append("text")
		.attr("y", 40)
		.attr("x", param.marginLeft)
		.attr("fill", "#ddccdd")
		.attr("class", "protein_browser_label")
		.text(ptm.name);
	    var b = label.append("g")
		.attr("class", "button")
	     	.style("cursor", "pointer")
	    	.on("click", function(){if(ptmSwitch == 1){ptmGraphSwitch(ptm.mod_id);}})
	    b.append("rect")
		.attr("y", 60)
		.attr("x", param.marginLeft)
		.attr("width", 50)
		.attr("height", 16)
		.attr("rx", 5)
		.attr("ry", 5)
		.attr("id", "norm_" + ptm.mod_id)
		.attr("fill", "#eecccc");
	    b.append("text")
		.attr("y", 72)
		.attr("x", param.marginLeft + 25)
		.attr("fill", "#ffffff")
		.attr("text-anchor", "middle")
		.style("cursor", "pointer")
		.text("norm.");
	    var b = label.append("g")
		.attr("class", "button")
	     	.style("cursor", "pointer")
	    	.on("click", function(){if(ptmSwitch == 0){ptmGraphSwitch(ptm.mod_id);}});
	    b.append("rect")
		.attr("y", 60)
		.attr("x", param.marginLeft + 60)
		.attr("width", 50)
		.attr("height", 16)
		.attr("rx", 5)
		.attr("ry", 5)
		.attr("id", "count_" + ptm.mod_id)
		.attr("fill", "#c6c6c6");
	    b.append("text")
		.attr("y", 72)
		.attr("x", param.marginLeft + 85)
		.attr("fill", "#ffffff")
		.attr("text-anchor", "middle")
		.style("cursor", "pointer")
		.text("count");

	    g.selectAll(".freq")
		.data(ptm.list)
		.enter()
		.append("path")
		.attr("class", "freq")
		.attr("stroke", "#888888")
		.attr("fill", "none")
		.attr("stroke-width", "2px")
		.attr("d", function(d){return "M" + d.x + " " + d.count_stroke; });
	    
	    g.append("path")
		.attr("stroke", "#c6c6c6")
		.attr("fill", "none")
		.attr("stroke-width", param.lineHeight + "px")
		.attr("d", "M " + (param.marginLeft + 1) + " " + param.freqLineY + " H " + (param.seqArea + param.marginLeft));
/*	    g.append("path")
		.attr("stroke", "#888888")
		.attr("fill", "none")
		.attr("stroke-width", "0.5px")
		.attr("d", "M " + (param.marginLeft + 1) + " " + (param.freqLineY - param.lineHeight / 2) + " H " + (param.seqArea + param.marginLeft));*/
	    g.append("path")
		.attr("stroke", "#888888")
		.attr("fill", "none")
		.attr("stroke-width", "0.5px")
		.attr("d", "M " + (param.marginLeft + 1) + " " + (param.freqLineY - param.lineHeight / 2 - param.freqHeight / 2) + " H " + (param.seqArea + param.marginLeft));
	    g.append("path")
		.attr("stroke", "#888888")
		.attr("fill", "none")
		.attr("stroke-width", "0.5px")
		.attr("d", "M " + (param.marginLeft + 1) + " " + (param.freqLineY - param.lineHeight / 2 - param.freqHeight) + " H " + (param.seqArea + param.marginLeft));

	    g.selectAll(".ptm")
		.data(ptm.list)
		.enter()
		.append("ellipse")
		.attr("class", "ptm")
		.attr("fill", function(d){ return d.color; })
		.attr("cx", function(d){ return d.x; })
		.attr("cy", param.freqLineY)
		.attr("rx", function(d){ return d.r; })
		.attr("ry", param.lineHeight / 2);	
	    g.selectAll(".ptm_txt")
		.data(ptm.list)
		.enter()
		.append("text")
		.attr("class", "ptm_txt protein_browser_mono")
		.attr("id", function(d){return d.site + d.position + "_" + ptm.mod_id; })
		.attr("x", function(d){ return d.x + 10; })
		.attr("y", param.freqLineY - 10)
		.attr("display", "none")
		.text(function(d){return d.site + d.position + ": " + d.count + "/" + d.position_count});
	    var display = "none";
	    if(param.scale == param.maxScale) display = "block";
	    g.append("text")
		.attr("fill", "#ffffff")
		.attr("class", "aaseq protein_browser_mono")
		.attr("y",  param.freqLineY + 5)
		.attr("display", display)
		.attr("textLength", param.seqLen * 10)
		.attr("lengthAdjust", "spacingAndGlyphs")
		.text(param.seq);
	    g.selectAll(".ptm_onmouse")
		.data(ptm.list)
		.enter()
		.append("path")
		.attr("class", "ptm_onmouse")
		.attr("fill", "none")
	    	.attr("stroke", "#888888")
		.attr("stroke-opacity", 0)
		.on("mouseover", function(d){
		    var y =  param.mouseY - group.delUnit.y["ptm_position_" + ptm.mod_id] - 10;
		    if(y > param.freqHeight - 10) y = param.freqHeight - 10;
		    svg.select('#' +  d.site + d.position + "_" + ptm.mod_id).attr("y", y).attr("display", "block"); })
		.on("mouseout", function(d){ svg.select('#' +  d.site + d.position + "_" + ptm.mod_id).attr("display", "none"); });

	    var h = param.freqHeight + param.lineHeight + param.margin;
	    group.delUnit.mkButton(renderDiv, "ptm_position_" + ptm.mod_id, h);
	    param.top += h;
	    svg.transition().duration(param.anime).attr("height", param.top);
	    group.x_axis_bg_height(renderDiv);
	}
	
	setData();
	render();
	plot();

	group.mouseEvent(svg, setData, plot);

    },

    ptm_linkage: function(data, renderDiv){
	var group = jpostdb.protein_browser;
	var param = group.param;
	var svg = renderDiv.select("#protein_browser_svg");

	var setData = function(){
	    for(var i = 0; i < data.link.length; i++){
		var sx = (data.link[i].pos_a - param.start) * param.seqArea / param.seqLen * param.scale + 5; // font-size/2
		var ex = (data.link[i].pos_b - param.start) * param.seqArea / param.seqLen * param.scale + 5; // font-size/2
		if(ex >= 0 && sx <= param.seqArea){
		    data.link[i].sx = Math.round(sx * 1000) / 1000 + param.marginLeft;
		    data.link[i].ex = Math.round(ex * 1000) / 1000 + param.marginLeft;
		    data.link[i].d = "block";
		}else if(ex < 0){
		    data.link[i].sx = param.marginLeft;
		    data.link[i].ex = param.marginLeft;
		    data.link[i].d = "none";
		}else if(sx > param.seqArea){
		    data.link[i].sx = param.seqArea + param.marginLeft;
		    data.link[i].ex = param.seqArea + param.marginLeft;
		    data.link[i].d = "none";
		}
	    }
	    for(var i = 0; i < data.site.length; i++){
		var x = (data.site[i].position - param.start) * param.seqArea / param.seqLen * param.scale + 5; // font-size/2
		if(x >= 0 && x <= param.seqArea){
		    data.site[i].x = Math.round(x * 1000) / 1000 + param.marginLeft;
		    data.site[i].d = "block";
		}else if(x < 0){
		    data.site[i].s = param.marginLeft;
		    data.site[i].d = "none";
		}else if(x > param.seqArea){
		    data.site[i].x = param.seqArea + param.marginLeft;
		    data.site[i].d = "none";
		}
		var r = param.scale / param.maxScale * 5 * 1.5;
		if(r < 2){ data.site[i].r = 2;}
		else if(r > 5){ data.site[i].r = 5;}
		else{ data.site[i].r = Math.round(r * 1000) / 1000;}
	    }
	}

	var plot = function(){	    
	    // psms
	    svg.select("g#ptm_linkage").selectAll(".link")
		.data(data.link)
	    	.attr("display", function(d){ return d.d;})
		.attr("d", function(d){ return "M " + d.sx + " 55  Q " + ((d.sx + d.ex) / 2) + " -10 " + d.ex + " 55"; });
	    svg.select("g#ptm_linkage").selectAll(".link_txt")
		.data(data.link)
		.attr("x", function(d){ return Math.round((d.sx + d.ex) / 2 * 1000) / 1000; })
	    svg.select("g#ptm_linkage").selectAll(".ptm")
		.data(data.site)
		.attr("display", function(d){ return d.d;})
		.attr("cx", function(d){ return d.x; })
		.attr("rx", function(d){ return d.r; });
	}

	var render = function(){
	    var g = svg.append("g")
		.attr("class", "ptm_linkage view_unit")
		.attr("transform", "translate(0," + param.top + ")")
		.attr("id", "ptm_linkage");
	    var label = g.append("g").attr("class", "protein_browser_label_set");
	    label.append("text")
		.attr("y", 40)
		.attr("x", 20)
		.attr("fill", "#ddccdd")
		.attr("class", "protein_browser_label")
		.text("P-site linkage");	    
	    g.selectAll(".link")
		.data(data.link)
		.enter()
		.append("path")
		.attr("class", "link")
		.attr("stroke", "#f28246")
		.attr("stroke-opacity", 0.5)
		.attr("fill", "none")
		.attr("stroke-width", function(d){ var w = Math.round(d.countLink / d.countBase * 20 * 1000) / 1000; if(w < 2) w = 2; return w + "px"; })
		.on("mouseover", function(d){ svg.select("#l" + d.pos_a + "_" + d.pos_b).attr("display", "block"); })
		.on("mouseout", function(d){ svg.select("#l" + d.pos_a + "_" + d.pos_b).attr("display", "none"); })
	    g.selectAll(".link_txt")
		.data(data.link)
		.enter()
		.append("text")
		.attr("class", "link_txt protein_browser_mono")
		.attr("id", function(d){ return "l" + d.pos_a + "_" + d.pos_b; })
		.attr("x", function(d){ return Math.round((d.sx + d.ex) / 2 * 1000) / 1000; })
		.attr("y", 10)
		.attr("display", "none")
		.attr("text-anchor", "middle")
		.text(function(d){return d.countLink + "/" + d.countBase; });
	    g.append("path")
		.attr("stroke", "#c6c6c6")
		.attr("fill", "none")
		.attr("stroke-width", param.lineHeight + "px")
		.attr("d", "M " + (param.marginLeft + 1) + " 60 H " + (param.seqArea + param.marginLeft));
	    g.selectAll(".ptm")
		.data(data.site)
		.enter()
		.append("ellipse")
		.attr("class", "ptm")
		.attr("fill", function(d){ return d.color; })
		.attr("cx", function(d){ return d.x; })
		.attr("cy", 60)
		.attr("rx", function(d){ return d.r; })
		.attr("ry", param.lineHeight / 2);
	    var display = "none";
	    if(param.scale == param.maxScale) display = "block";
	    g.append("text")
		.attr("fill", "#ffffff")
		.attr("class", "aaseq protein_browser_mono")
		.attr("y",  60 + 5)
		.attr("display", display)
		.attr("textLength", param.seqLen * 10)
		.attr("lengthAdjust", "spacingAndGlyphs")
		.text(param.seq);

	    var h = 70 + param.lineHeight + param.margin;
	    group.delUnit.mkButton(renderDiv, "ptm_linkage", h);
	    param.top += h;
	    svg.transition().duration(param.anime).attr("height", param.top);
	    group.x_axis_bg_height(renderDiv);
	}
	
	setData();
	render();
	plot();

	group.mouseEvent(svg, setData, plot);
    },

    delUnit: {
	y: {},
	mkButton: function(renderDiv, gid, h){
	    var group = this;
	    var param = jpostdb.protein_browser.param;
	    var svg = renderDiv.select("#protein_browser_svg");
	    var unit = svg.select("#" + gid);
	    var g = unit.append("g")
		.attr("class", "del_button protein_browser_label_set")
		.style("cursor", "pointer")
	    	.on("click", function(){ group.remove(renderDiv, gid, h); });
	    g.append("rect")
		.attr("x", param.width - param.marginRight - 20)
		.attr("y", 5)
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
		.attr("d", "M " + (param.width - param.marginRight - 18) + " 7 L " + (param.width - param.marginRight - 7) + " 18");
	    g.append("path")
		.attr("stroke-width", "3px")
		.attr("stroke", "#c6c6c6")
		.attr("d", "M " + (param.width - param.marginRight - 7) + " 7 L " + (param.width - param.marginRight - 18) + " 18");
	    this.y[gid] = param.top;
	},

	remove: function(renderDiv, gid, h){
	    var param = jpostdb.protein_browser.param;
	    var svg = renderDiv.select("#protein_browser_svg");
	    var form = renderDiv.select("#protein_browser_form");
	    svg.select("#" + gid).remove();
	    var array = Object.keys(this.y);
	    for(var i = 0; i < array.length; i++){
		if(this.y[array[i]] >= this.y[gid] + h){
		    this.y[array[i]] -= h;
		    svg.select("#" + array[i]).transition().duration(param.anime).attr("transform", "translate(0," + this.y[array[i]] + ")");
		}
	    }
	    param.top -= h;
	    svg.transition().duration(100).attr("height", param.top);
	    svg.selectAll("rect.x_axis_back").transition().duration(100).attr("height", param.top - param.marginTop - param.margin);
	    form.select("#sel_list_" + gid).attr("disabled", null); form.select("#sel_list_def").attr("selected", null).attr("selected", true);
	},
    },
	
    mouseEventCheck: function(mouseEveElement){
	var param = jpostdb.protein_browser.param;
	param.mouseOnElement = false;
	mouseEveElement.on("mouseover", function(){ param.mouseOnElement = true;});
	mouseEveElement.on("mouseout", function(){ param.mouseOnElement = false;});
    },
    
    mouseEvent: function(mouseEveElement, setData, plot){
	var param = jpostdb.protein_browser.param;
	var setTimeoutId = null; // scroll stop timer
	var scrolling = false; // scroll flag
	
	var setParamStart = function(){
	    if(param.start < 1) param.start = 1;
	    if((param.seqLen - param.start - 1) * param.scale < param.seqLen) param.start = param.seqLen * (param.scale - 1) / param.scale + 1;
	};
	
	// drag = [mouseDown + mouseMove + mouseUp] 
	var mouseMoveEvent = function(){
	    var mouse = d3.mouse(this);
	    param.mouseX = mouse[0];
	    param.mouseY = mouse[1];
	};
	
	var mouseMoveEventDraw = function(){
	    if(param.mouseOnElement){
		if(param.dragFlag){
		    param.start = param.dragStartX + (param.dragMouseX - param.mouseX) / param.seqArea * param.seqLen / param.scale;
		    setParamStart();
		    setData();
		    plot();
		}
	    }else{
		param.dragFlag = false;
	    }
	};

	var mouseDownEvent = function(){
	    if(param.mouseOnElement){
		param.dragFlag = true;
		param.dragStartX = param.start;
		param.dragMouseX = param.mouseX;
	    }
	}
	
	var mouseUpEvent = function(){
	    if(param.dragFlag) param.dragFlag = false;
	}


	var preventDefault = function(e) {
	    e = e || window.event;
	    if (e.preventDefault)
		e.preventDefault();
	    e.returnValue = false;  
	}
	
	// scroll
	var scrollEvent = function(e){
	    if(param.mouseOnElement){
		window.onwheel = preventDefault;
		scrolling = true ;
		var target = e.target;
		var delta = e.deltaY ? -(e.deltaY) : e.wheelDelta ? e.wheelDelta : -(e.detail);
		var position = (param.mouseX - param.marginLeft) * param.seqLen / param.seqArea / param.scale;
		if(delta > 0 && param.scale != param.maxScale){
		    param.scale *= 1.03;
		    if(param.scale > param.maxScale) param.scale = param.maxScale;
		}else if(delta < 0 && param.scale != 1){
		    param.scale /= 1.03;
		    if(param.scale < 1) param.scale = 1;
		}
		param.scale = Math.round(param.scale * 100) / 100;
		var newPosition = (param.mouseX - param.marginLeft) * param.seqLen / param.seqArea / param.scale;	
		param.start += position - newPosition;
		param.start = Math.round(param.start * 100) / 100;
		setParamStart();
		setData();
		plot();

		// (同期して描画すると重いので、各表示それぞれのタイミングで個別に描画。
		// タイミングが違うので微妙にずれる。スクロール終了を検知したら全部の描画をし直して合わせる)
		if(setTimeoutId){ clearTimeout(setTimeoutId); }
		setTimeoutId = setTimeout( function() {
		    // re-plot if stoped scroll 
		    setParamStart();
		    setData();
		    plot();
		    scrolling = false;
		    setTimeoutId = null;
		}, 100 );
		
	    }else{
		window.onwheel = true;
	    }
	}

	mouseEveElement.on("mousemove", mouseMoveEvent, false);
	mouseEveElement.on("mousedown", mouseDownEvent, false);	
	d3.select(window).on("mouseup", mouseUpEvent, false);
	var mousewheel = "onwheel" in document ? "wheel" : "onmousewheel" in document ? "mousewheel" : "DOMMouseScroll";
	document.addEventListener (mousewheel,  scrollEvent, false);
	document.addEventListener ("mousemove",  mouseMoveEventDraw, false);
    },

};
