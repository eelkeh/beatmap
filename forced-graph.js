/*
forced-graph.js
Created by Eelke Hermens on 2012-03-25.
*/

var forcedGraph = {}

	forcedGraph.treshold = 1000, // Only consider nodes bigger than this
	forcedGraph.width = 1020,
	forcedGraph.height = 490,		
	forcedGraph.r = 20,
	forcedGraph.shiftTo = 200, // Shift all svg nodes/links to the right by this amount
	forcedGraph.clicked = null,
	forcedGraph.push = [],
	forcedGraph.prevPush = [],
	forcedGraph.json = {};
	forcedGraph.currentYearGenres = [];
	forcedGraph.color = d3.scale.category20();
	forcedGraph.once = false;
		
	forcedGraph.force = d3.layout.force()
		.size([forcedGraph.width, forcedGraph.height])
		//.theta(0.9)
		.charge(-600)
		.gravity(0.1)
		.distance(700)
		.linkDistance(60)

$(document).ready(function() {
	

	
	$fg = $('#bubbles');
	
	$('#tabs .genres').click( function() {
		$(this).css('background', 'url(images/genre-tab-on.png)');
		$('#tabs .map').css('background', 'url(images/worldmap-tab-off.png)');
		$fg.removeClass('hide');
	});
	
	$('#tabs .map').click( function() {
		$(this).css({'background' : 'url(images/worldmap-tab-on.png)'});
		$('#tabs .genres').css('background', 'url(images/genre-tab-off.png)');
		$fg.addClass('hide');
	});
	
	$('#buttons li').hover(function() {
		if ($(this).hasClass('on')) {
			return;
		}
		var _src = $(this).find('img').attr('src');
		var _nr = $(this).index() + 1;
		$(this).find('img').attr('src', 'images/g' + _nr + '-on.png')
		//console.log(_src,_nr);
	}, function() { 
		if ($(this).hasClass('on')) {
			return;
		}
		var _src = $(this).find('img').attr('src');
		var _nr = $(this).index() + 1;
		$(this).find('img').attr('src', 'images/g' + _nr + '-hover.png')	
	
	});
	
	$('#buttons li').click( function() {
		
		$('#buttons li').each( function() {
			var _nr = $(this).index() + 1;
			$(this).removeClass('on');
			$(this).find('img').attr('src', 'images/g' + _nr + '-hover.png');	
		});		
		
		var _src = $(this).find('img').attr('src');
		var _nr = $(this).index() + 1;
		$(this).find('img').attr('src', 'images/g' + _nr + '-active.png')
		$(this).addClass('on');
		//forcedGraph.clicked;
		var _label = $(this).find('.label').html();
		var _id = forcedGraph.nodesHashRev[_label];
		var _d = {};
		_d.id = _id;
		nodeClick(_d);	
		yearBtn = lookForFirstYear(_label);				
		$('#slider').slider('value', yearBtn);
	});
	
	$('.picked-genre img').live('click', function() {
		var _genre = $(this).parent().text();
		var _id = genres.indexOf(_genre); 
		//console.log(_genre, _id);
		if (_id != -1) genres.splice(_id, 1);
		$(this).parent().remove();
		console.log(genres);
		didChange = true;
		
		if (genres.length == 0) {
			$('#box').removeClass('one-record');	
		}
		else if (genres.length == 1) {
			$('#box').removeClass('two-record');
			$('#box').addClass('one-record');	
		}
		else if (genres.length == 2) {
			$('#box').removeClass('one-record');
			$('#box').removeClass('three-record');
			$('#box').addClass('two-record');
		}
		
	});
	
	$('.gogogo').hover(function() {
		$(this).attr('src', 'images/i-get-it-button-1.png')
	}, function() {
		$(this).attr('src', 'images/i-get-it-button-2.png')
	});
	$('.gogogo').click(function() {
		$('#splash').fadeOut('slow');
	});	
	
	forcedGraph.box = $('#box'),
	forcedGraph.boxCo = forcedGraph.box.offset(),
	forcedGraph.boxX = [forcedGraph.boxCo.left, forcedGraph.boxCo.left + forcedGraph.box.width() ],
	forcedGraph.boxY = [forcedGraph.boxCo.top, forcedGraph.boxCo.top + forcedGraph.box.height() ];	
	
	forcedGraph.svg = d3.select("#forced-graph").append("svg")
		.attr("width", forcedGraph.width)
	 	.attr("height", forcedGraph.height);

		createDefs(forcedGraph.svg.append('svg:defs'));
	
	$.getJSON('forced_genres_alt.txt', function(data) {
		//json = removeOrphans(data);
		forcedGraph.json = data;
		forcedGraph.nodesHash = getHashes();
		forcedGraph.nodesHashRev = flipHashes();
	});
	
	$(document).ajaxStop(function() {	
		setTimeout(function() {
			console.log('Ajax stopped');
			searchInit();
			if (!forcedGraph.once) {
				forcedGraph.update();
				forcedGraph.once = true;
			}
			//yyyy = 1985;
			forcedGraph.currentYearGenres = filterByYear(yyyy);
			forcedGraph.push = [124, 516, 253, 44, 1004, 905, 522, 412, 431, 510, 586, 949, 311];
			//forcedGraph.push = [516];
			forcedGraph.update();
		}, 100);
	});
	
});

function getHashes() {
	var hashed = {} 
	for (i=0, l=forcedGraph.json.nodes.length; i < l; i++) {
		hashed[forcedGraph.json.nodes[i].id] = forcedGraph.json.nodes[i].name;
	}
	return hashed;
}

function flipHashes() {
	var hashed = {} 
	for (i=0, l=forcedGraph.json.nodes.length; i < l; i++) {
		hashed[forcedGraph.json.nodes[i].name] = forcedGraph.json.nodes[i].id;
	}
	return hashed;
}


forcedGraph.update = function() {
	console.log('updating force graph...')
	var data = flatten(forcedGraph.json),
			nodes = data.nodes,
			links = data.links
	// console.log(data);
	// Reboot force layout	
	
	// Update nodes	
	var records = forcedGraph.svg.selectAll("g.node")
   	.data(nodes, function(d) { return d.id; });
	
	records.selectAll("image")
		.attr("xlink:href", function(d) { if (d.id == forcedGraph.clicked) { return "images/50-new-disk2.png"; } else { return "images/50-new-disk3.png"; } })
		.transition()
		.duration(500)
		
	records.transition()
		.duration(500)	
		
	// Update link data
	var link = forcedGraph.svg.selectAll("line.link")
  	.data(links)//,function(d) { return d.target.id; });
	
	// Enter new links
	link.enter().insert("svg:line")
		.attr("class", "link")
    .style("stroke-width", function(d) { return 1; })
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });
 
	// Exit any old links.
	link.exit().remove();	
		
	// Exit old nodes
	records.exit().remove();	
		
	//d3.selectAll("image.record")
	//	.data(nodes, function(d) { console.log(d); return d.id; }) 
		
	var insert = records.enter().insert("svg:g")
		.attr("class", "node")	
		.attr("data-id", function(d) { return d.id; } )
		.attr("x", function(d) { return d.x + 500; })
		.attr("y", function(d) { return d.y; })
		.on("click", nodeClick)
		.on("mouseover", nodeHover)
		.on("mouseout", nodeHoverout)
		//.call(force.drag)
		//.call(d3.experiments.dragAll);
		.call(d3.behavior.drag() 
			.on("dragstart", function(d) {
				//console.log(d); 
		 	})
			.on("drag", function(d) { 
				//console.log(d);
			})	
		
		) /*<THIS WORKS*/
		.call(forcedGraph.force.drag);
		//.on('dragstart', function(d) {console.log(d)})
		

	/*node.append("circle")
  	.attr("class", "circle")
 		.attr("r", function(d) { return Math.sqrt(d.size/2); })
  	.style("fill", function(d) { 
			//return 'rgb(255, 140, 0)'
			if (d.id == forcedGraph.clicked) { return 'yellow' }
			else { return 'orange' } 
			})
		//.style("stroke", "black")	
		.style("stroke", "#ff4500")
		.style("stroke-width", "1.5px")
		.attr("filter", "url(#dropShadow)")
  		//.call(force.drag);*/

	insert.append("image")
  	.attr("class", "record circle")
	  .attr("xlink:href", function(d) { if (d.id == forcedGraph.clicked) { return "images/50-new-disk2.png"; } else { return "images/50-new-disk3.png"; } })
	  .attr("x", function(d) { return -Math.sqrt(d.size/1)/2 })
	  .attr("y", function(d) { return -Math.sqrt(d.size/1)/2 })
	  .attr("width", function(d) { return Math.sqrt(d.size)*1.2; })
	  .attr("height", function(d) { return Math.sqrt(d.size)*1.2; }	)
		.style("stroke","black")
		.on("mouseover",  function() { d3.select(this).attr("xlink:href", "images/50-new-disk1.png");} )
		//.on("mouseover",  function() { d3.select(this).transition().duration(400).style("stroke-width", "3");} )
		.on("mouseout",  function(d) { 
			if (d.id == forcedGraph.clicked) {
				d3.select(this).attr("xlink:href", "images/50-new-disk2.png");
			}
			else {
				d3.select(this).attr("xlink:href", "images/50-new-disk3.png");
			}
		})

	insert.append("text")
		.attr("class", "forced-label")
		.attr("dx", ".1em")
		.attr("dy", "-.2em")
    .text(function(d) { return d.name; })
		.style("font-size", function(d) { var size = Math.sqrt(d.size); if (size < 10) size = 10; if (size > 15) size = 15; return size })
		//.style("font-family", 'Helvetica, Arial')
		.style("fill", 'white')
		.on("mouseover",  function() { d3.select(this).transition().duration(400).style("fill","yellow");} )
		.on("mouseout",  function() { d3.select(this).transition().duration(400).style("fill","white");} )
		//.style("background-color", 'blue')
 
	forcedGraph.force	
		.nodes(nodes)
   	.links(links)
  	.on("tick", function() {
			//node.attr("cx", function(d) { return d.x = Math.max(forcedGraph.r, Math.min(forcedGraph.width - forcedGraph.r, d.x)); })
			// 		.attr("cy", function(d) { return d.y = Math.max(forcedGraph.r, Math.min(forcedGraph.height - forcedGraph.r, d.y)); });
			//console.log('tick');
			records.attr("transform", function(d) { return "translate(" + (Math.max(forcedGraph.r, Math.min(forcedGraph.width - forcedGraph.r, d.x))) + "," +  (Math.max(forcedGraph.r, Math.min(forcedGraph.height - forcedGraph.r, d.y))) + ")"; });	
	   	link.attr("x1", function(d) { return (Math.max(forcedGraph.r, Math.min(forcedGraph.width - forcedGraph.r, d.source.x))); })
	    		.attr("y1", function(d) { return (Math.max(forcedGraph.r, Math.min(forcedGraph.width - forcedGraph.r, d.source.y))); })
	     		.attr("x2", function(d) { return (Math.max(forcedGraph.r, Math.min(forcedGraph.width - forcedGraph.r, d.target.x))); })
	     		.attr("y2", function(d) { return (Math.max(forcedGraph.r, Math.min(forcedGraph.width - forcedGraph.r, d.target.y))); });
		})
		.start();
		
	//forcedGraph.svg.selectAll("line.link")	
	forcedGraph.svg.selectAll("g.node").sort();
	
  
}

function nodeClick(d) {
	console.log(d.id);
	if (d.id == forcedGraph.clicked) {
		forcedGraph.push = getAllLinkedToBack([d.id], forcedGraph.json.links);
	}
	else {	
		forcedGraph.push = getAllLinkedTo([d.id], forcedGraph.json.links);
		/*console.log(forcedGraph.push);
		for (i in forcedGraph.push) {
			if (forcedGraph.nodesHash[forcedGraph.push[i]] < forcedGraph.treshold) {
				console.log(i)
				forcedGraph.push.remove(i);
			}	
		}
		console.log(forcedGraph.push);*/
	}
	//push.push(d.id);
	forcedGraph.clicked = d.id;
	forcedGraph.update();
}

function filterByYear(filterYear) {
	//forcedGraph.json
	var gs = [];
	for (i=0, l=jsonData.children.length; i < l; i++) {
		if (filterYear == jsonData.children[i].year) {
			var g = jsonData.children[i].genre;
			if (gs.indexOf(g) === -1) {
				var gid = forcedGraph.nodesHashRev[g];
				gs.push(gid);
			}
		}			
	}
	//console.log(gs)
	return gs
}

function tick() {
	link.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
 		.attr("x2", function(d) { return d.target.x; })
  	.attr("y2", function(d) { return d.target.y; });
	
	node.attr("transform", function(d) { return "translate(" + (d.x) + "," +  (d.y) + ")"; });		
}

function nodeHover(d) {
	//$('[data-id=' + d.id + ']').find('circle').attr('style', 'fill:#000');
}
function nodeHoverout(d) {
	//$('[data-id=' + d.id + ']').find('circle').attr('style', 'fill:red');
}
 


function flatten(root) {
	if (forcedGraph.push.length === 0) {
		return root;
	}
	
	var newRoot = {};
	newRoot.nodes = [], newRoot.links = []
	
	root.nodes.forEach( function(t) {
		if (forcedGraph.push.indexOf(t.id) > -1) {
			if (forcedGraph.currentYearGenres.indexOf(t.id) > -1) {
				newRoot.nodes.push(t);
			}
		}
		else {
			//console.log(t);
		}
	});
	//console.log(root.links)
	root.links.forEach( function(t) {
		var src = typeof t.source == 'object' ? t.source.id : t.source;
		var trget = typeof t.target == 'object' ? t.target.id : t.target;
		if (	src != undefined && trget != undefined 
					&& forcedGraph.push.indexOf(src) > -1 
					&& forcedGraph.push.indexOf(trget) > -1
					&& forcedGraph.currentYearGenres.indexOf(src) > -1
					&& forcedGraph.currentYearGenres.indexOf(trget) > -1
					) {
						newRoot.links.push(t);			
		}
		else {
			//console.log(t);
		}
	});
	return newRoot;
}

function getAllLinkedTo(nodes, links) {
    var result = [];
    for (var i=0; i<nodes.length; i++) {
			var _clickedGenre = forcedGraph.nodesHash[nodes[i]];
			getChildren(nodes[i]);   		
		}				
    function getChildren(node) {
        if (result.indexOf(node) > -1) {
           return;	
				}	
				//if (forcedGraph.currentYearGenres.indexOf(forcedGraph.nodesHash[node]) > -1) {			
				//console.log(forcedGraph.nodesHash[node]);	
        	result.push(node);
				//}	
        for (var i=0; i<links.length; i++) // a source -> targets mapping object would be beneficial
            if (links[i].target.id == node)
                getChildren(links[i].source.id);
    }
    return result;
}

function getAllLinkedToBack(nodes, links) {
    var result = [];
    for (var i=0; i<nodes.length; i++)
        getChildren(nodes[i]);
    function getChildren(node) {
        if (result.indexOf(node) > -1)
            return;
        result.push(node);
        for (var i=0; i<links.length; i++) // a source -> targets mapping object would be beneficial
            if (links[i].source.id == node)
                getChildren(links[i].target.id);
    }
    return result;
}

/*var chList = [];	
function getTargets(nodeList) {
	if (nodeList.length > 0) {
		console.log('go');
		var _nList = getChildren(nodeList, json.links);
		chList = chList.concat( _nList );
		getTargets(_nList);
	}
	else {
		return chList;
	}
}*/

// all jQuery goes here
$(function() {
	$('#button').click( function(){
			
	});
});

function createDefs(defs) {

var dropShadowFilter = defs.append('svg:filter')
      .attr('id', 'dropShadow')
	  .attr('filterUnits', "userSpaceOnUse")
	  .attr('width', '250%')
	  .attr('height', '250%');
    dropShadowFilter.append('svg:feGaussianBlur')
      .attr('in', 'SourceGraphic') 
      .attr('stdDeviation', 10)
      .attr('result', 'blur-out'); 
    dropShadowFilter.append('svg:feColorMatrix')
			.attr('in', 'blur-out') 
	  	.attr('type', 'hueRotate')
	  	.attr('values', 200)	
      .attr('result', 'color-out');
    dropShadowFilter.append('svg:feOffset')
	  	.attr('in', 'color-out')
			.attr('in', 'SourceAlpha')			
      .attr('dx', 2)
      .attr('dy', 2)
      .attr('result', 'the-shadow');
    dropShadowFilter.append('svg:feBlend')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'the-shadow')
	  .attr('mode', 'normal');

}

function draggingEvent(d) {
		//console.log(d.px, d.py);
	if (d.px > forcedGraph.boxX[0] 
			&& d.px < forcedGraph.boxX[1]
			&& d.py > forcedGraph.boxY[0]
			&& d.py < forcedGraph.boxY[1] 
	) {
		forcedGraph.box.addClass('caught');
		//console.log('caught!');
	}
	else {
		forcedGraph.box.removeClass('caught');
	}
	
	if (d.px < forcedGraph.boxX[1]) {
		
		
		forcedGraph.box.addClass('caught');
		
		
		//console.log('caught!');
	}
	
}
function endOfDrag(d) {
	forcedGraph.box.removeClass('caught');
	if (d.px > forcedGraph.boxX[0] 
			&& d.px < forcedGraph.boxX[1]
			&& d.py > forcedGraph.boxY[0]
			&& d.py < forcedGraph.boxY[1] 
	) {
		//$('#list').append('<li class="picked-genre">' + d.name + '</li>');
	}
	if (
			d.px < forcedGraph.boxX[1]
	) {
		if (genres.length < 3 && genres.indexOf(d.name) === -1) {
			if (genres.length == 0) {
				$('#box').addClass('one-record');	
				var colorx = 'blue';
			}
			else if (genres.length == 1) {
				$('#box').removeClass('one-record');
				$('#box').addClass('two-record');	
				var colorx = 'orange';
			}
			else if (genres.length == 2) {
				$('#box').removeClass('one-record');
				$('#box').removeClass('two-record');
				$('#box').addClass('three-record');
				var colorx = 'green';
			}
			 
			console.log('list append');
			$('#list').append('<li class="picked-genre"><img src="images/x' + colorx + '.png"/>' + d.name + '</li>');
			genres.push(d.name);
			var y = $('#slider').slider('value');
			runVis(y);	
		}	
	}
}

function removeOrphans(data) {
	var removeThese = [];
	for (var i = 0, len = data.nodes.length; i < len; i++) {
		if (lookForLinks(data.nodes[i].id, data) === false) {
			removeThese.push(i);	
		}
	}	
	for (i in removeThese) {
		data.nodes.splice(removeThese[i], 1);
	}
	
	return data;
}

function lookForLinks(nodeId, data) {
	//console.log(nodeId);
	var isLinked = false;
	for (var i = 0, len = data.links.length; i < len; i++) {
		//console.log(data.links[i].source, nodeId)
		if (data.links[i].source === nodeId || data.links[i].target === nodeId) {
			isLinked = true;
			break;
		}
	}
	return isLinked;
}

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};