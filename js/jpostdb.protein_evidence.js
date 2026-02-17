// jPOST-db Protein evidence

jpostdb.protein_evidence = jpostdb.protein_evidence || {
    param: {
	width: 10,
	height: 10,
	top: 0,
	size: 240, // pie chart size
	margin: 20,
	anime: 100
    },

    svg_height: {},

    init: function(stanza_params, stanza, renderDiv){
	var group = jpostdb.protein_evidence;
	var param = group.param;
	param = jpostdb.init_param(param, stanza_params, stanza, renderDiv);
	
	var renderDiv = d3.select(param.renderDiv);
	var view = renderDiv.append("div").attr("class", "view");
	var svg = view.append("svg")
	    .attr("id", "pie_chart_svg")
	    .attr("width", param.width)
	    .attr("height", param.height);
	var table = view.append("div")
	    .style("padding", "0px")
	    .attr("id", "protein_table");

	
	var url = jpostdb.api + "proteins_evidence?" + param.apiArg.join("&");
//	jpostdb.httpReq("get", url, null, group.pie_chart, svg, renderDiv, param.width / 2, 0);
	jpostdb.fetchReq("get", url, null, renderDiv, param.width, group.pie_chart);
    },

    pie_chart: function(data, renderDiv){
	var group = jpostdb.protein_evidence;
	var param = group.param;
	var svg = renderDiv.select("#pie_chart_svg");
	var table = renderDiv.select("#protein_table");

	var showProteinList = function(id){
	    var url = jpostdb.api + "protein_with_evidence?" + param.apiArg.join("&") + "&evidence=" + id;
	 //   jpostdb.httpReq("get", url, null, group.protein_with_evidence, svg, renderDiv, param.width / 2, param.top);
	    jpostdb.fetchReq("get", url, null, renderDiv, param.width, group.protein_with_evidence);
	}
	
	var h = param.size + param.margin + param.margin;
	svg.transition().duration(param.anime).attr("height", h);
	jpostdb.utils.pie_chart(data, svg, param.size, param.width, h, showProteinList);


    },

    protein_with_evidence: function(data, renderDiv){
	var group = jpostdb.protein_evidence;
	var param = group.param;
	var svg = renderDiv.select("#pie_chart_svg");
	var table = renderDiv.select("#protein_table");
	var id = "proteins_with_evidence";

	var h = param.size + param.margin + param.margin;
	svg.transition().duration(param.anime).attr("height", h);
	jpostdb.utils.table(data, table, id, 15, 0);	
    }
};
