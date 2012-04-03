// Load and cache the JSON datasource

var jsonData = {}
		countUS = 0,
		yyyy = 0,
		genres = [],
		dataCache = {},
		count = 0,
		yearBtn = 1975,
		didChange = false
		;

var flag = []; flag["rock"]=1; flag["pop"]=1; flag["metal"]=1; flag["country"]=1; flag["classic"]=1; flag["hiphop"]=1; flag["jazz"]=1; flag["electronic"]=1; flag["reggae"]=1;

var r1 = 980, r2 = 490, format = d3.format(",d"), fill = d3.scale.category10();

var bubble = d3.layout.pack()
			.sort(null)
			.size([r1,r2]);

$.getJSON('glcy-fixed.json', function(data) 
{
	window.jsonData = data;
}) 
$.getJSON('geo-loc-countries-edited.json', function(data) 
{
	window.jsonCountries = data;
})

$(document).ready( function() 
{ 
	$(document).ajaxStop(function()
	{
		vis = d3.select("#chart").append("svg")
				.attr("width", r1)
				.attr("height", r2)
				//.attr("class", "bubble");
		
		d3.selectAll("g.bubble").sort(function(a,b) { console.log(a); return  b.value - a.value });
				
		$('#slider').slider(
		{
			min: 1920,
			max: 2011, 
			value: 1975,
			slide: function (event, ui) 
			{
				//var year = ui.value; 
				//yearBtn = year;
			},
			change: function (event, ui) 
			{
				if (ui !== undefined) {
				var year = ui.value;
				yearBtn = ui.value;		
			} 
			else 
			{
				var year = $('#slider').slider('value');
			}
			
				$("#year").fadeOut( 200, function() {
					$(this).html(year).fadeIn(200);
				});
				didChange = true;
			
			}
		}); 

		var slider = $('#slider'); 
		slider.slider('option', 'change').call(slider);
		$('#year').html( $('#slider').slider('value') );
		
		//jq	
		var $node = $("#chart .bubble");	
		$node.live("mouseover", function() {
			$('.pop-up').remove();
			var _genre = $(this).find('.bubble-label').text();
			var popupData = getPopupData(_genre);
			var text = '<div class="loc-header">' + _genre  + '</div><ul>';
			$.each(popupData, function(i,p) {
				text += '<li><span class="genre">' + p.genre + '<span class="genre-count">' + p.count + '<span></li>';
			}); 
			text += '</ul>';
			$('body').append('<div class="pop-up fade">' + text + '</div>');
			$('.pop-up').css({'left' : $(this).offset().left + 20, 'top' : $(this).offset().top - 20 })
				.addClass('in');
			
		});
		$node.live("mouseout", function(){
		  //$(this).find('.bubble-label').fadeOut('fast');
			//setTimeout(function() { 	$('.pop-up').remove(); }, 3500);
		
		});
		
		$("#chart").mouseleave(function() {
			$('.pop-up').remove();
		});
		
		var $forcedRecords = $('.circle.record');
		$forcedRecords.live("mouseover", function() {
			//$(this).attr('class', 'circle record spinning');
		});
	
		
		
	}); 
}); 

setInterval(function() {
    if ( didChange ) {
        didChange = false;
        runVis(yearBtn);
				forcedGraph.currentYearGenres = filterByYear(yearBtn);
				//forcedGraph.push = forcedGraph.currentYearGenres;
				forcedGraph.update();
    }
}, 350);

function getPopupData(loc) {
	// Look up info in the cached data for the current year
	var localdata = [];
	for (i=0, l=dataCache.children.length; i < l; i++) {
		if (loc == dataCache.children[i].slocation) {
			localdata.push({ 'genre' : dataCache.children[i].sgenre, 'count' : dataCache.children[i].value });
		}
	}
	return localdata;
} 

function runVis(year) 
{
	dataCache = classes(jsonData, year);
	
	//setTimeout(function() {
		console.log('updating bubble...');		
		var circles = vis.selectAll("g.bubble")
			.data(bubble.nodes(dataCache).filter(function(d) { return !d.children; }), function(d) {return d.id; });

	// Transform existing bubbles
		circles.transition()
			.duration(600)

		d3.selectAll("circle")
			.data(bubble.nodes(dataCache).filter(function(d) { return !d.children; }), function(d) { return d.id; }) 
			.transition() 
			.duration(600)
			.attr("r", function(d) {radii=d.value*((4/1000)*r1); return radii;}) 
			//.sort(function(a,b) { console.log(a); return  b.value - a.value })	
		
		
	// Remove obsolete bubbles
		circles.exit()
			.remove();

	// New bubbles
		var insert = circles.enter().insert("g")
									.attr("class", "bubble")
									.attr("transform", function(d) 
									{ 
									return "translate(" +d.gx+ "," +d.gy+ ")"; 
									})
									//.sort(function(a,b) { console.log(a); return  b.value - a.value })			
								

		insert.append("circle")
			.transition().duration(500)
			.attr("r", function(d) { playSound(); radii=d.value*((4/1000)*r1); return radii;}) 
			.style("fill", function(d) { 
				if (d.sgenre == genres[0]) {
					return '#1F77B4';
				}
				if (d.sgenre == genres[1]) {
					return '#F36F21';
				}	
				if (d.sgenre == genres[2]) {
					return '#2CA02C';	
				}
			});
			
			
			//.style("fill", function(d) { return fill(d.sgenre);})
			//.attr("stroke", 'white')
			//.attr('stroke-width', '1')
		
		insert.append("title")
			.text(function(d) { return d.sgenre +" :" + d.slocation; });

		insert.append("text")
			.transition().duration(500)
			.attr("text-anchor", "middle")
			.attr("class", "bubble-label")
			.attr("dy", "-0.1em")
			.style("fill", 'white')
			.text(function(d) {return d.slocation;})
			
			insert.append("text")
				.attr("class", "count")
				.text( function(d) { return d.value;} );		
			
		d3.selectAll("g.bubble").sort(function(a,b) { return  b.value - a.value });	
	//}, 200);			
}

function classes(jsonData, year) 
{	//define containers for data to be organized in
	var classes = []; //primary data container

	function recurse(name, node)
	{
		if (node.children) //if node has children, go deeper
		{
			node.children.forEach(function(child) {recurse(node.name, child); }); //for each of the childred, go even deeper
		}

		else if ( parseInt(node.year) === year)  //once no more children, check year, genre, location, layer value(similar to z-index) and set into data array (classes[])
		{
			if (genres.indexOf(node.genre) > -1) //as long as genre set isnt empty, go in
			{
				node.lon=-r1; //set default latitudes and longitudes so that if theres no match between locations, those circles are thrown out of the visual area
				node.lat=-r2;
				// Look the geocoords
				$.each(jsonCountries, function(index, value) //for each country in the geo-loc dataset
				{ 
					if (node.location === value.name) //if the location of genre dataset matches a location in the geo dataset, go in
					{
						var templon = Math.floor(value.longitude); //set some temporary variables for longitude and latitude
						var templat = Math.floor(value.latitude);
					
						if (templon<=-90 && templat>=15) //North America (expanded)
						{
							var scale = Math.floor((9/1080)*r1);
							templon=templon*scale; //spread the long-lat coords in a wider area
							templat=templat*scale;
							node.lon=(r1/3)+((820	/1080)*r1)+templon; //position it on the screen pixel area with a manually tuned center point for each continent
							node.lat=(r2/2)+((350/540)*r2)-templat;
						}
						if (templon<-45 && templon>-90 && templat>30 && templat<55) //NE America
						{
							var scale = Math.floor((12/1080)*r1);
							templon=templon*scale; 
							templat=templat*scale;
							node.lon=(r1/2)+((770/1080)*r1)+templon; 
							node.lat=(r2/2)+((350/540)*r2)-templat;
						}
						if (templon>=-120 && templon<=-30 && templat<=30 && templat>=-60) //South America (condensed)
						{
							var scale = Math.floor((3/1080)*r1);
							templon=templon*scale;
							templat=templat*scale;
							node.lon=(r1/2)+templon+70;
							node.lat=(r2/2)+((160/540)*r2)-templat;						
						}
						if (templon>-45 && templon<45 && templat<90 && templat>-30) //Europe (expanded)
						{
							var scale = Math.floor((6.5/1080)*r1);
							templon=templon*scale;
							templat=templat*scale;
							node.lon=(r1/2)+((170/1080)*r1)+templon;
							node.lat=(r2/2)+((150/540)*r2)-templat;
						}
						if (templon>45 && templon<180 && templat<90 && templat>-15) //Asia (condensed)
						{
							var scale = Math.floor((2/1080)*r1);
							templon=templon*scale;
							templat=templat*scale;
							node.lon=(r1/2)+((270/1080)*r1)+templon;
							node.lat=(r2/2)+((20/540)*r2)-templat;
						}
						if (templon>105 && templon<180 && templat<-15 && templat>-50) //Australia (condensed)
						{
							var scale = Math.floor((2/1080)*r1);
							templon=templon*scale;
							templat=templat*scale;
							node.lon=(r1/2)+((190/1080)*r1)+templon;
							node.lat=(r2/2)+((160/540)*r2)-templat;
						}
						if (templon>-25 && templon<60 && templat<65 && templat>-40) //Africa (condensed)
						{
							var scale = Math.floor((2/1080)*r1);
							templon=templon*scale;
							templat=templat*scale;
							node.lon=(r1/2)+templon+70;
							node.lat=(r2/2)+((120/540)*r2)-templat;
						}
					}
				}); 
				var id = hash(node);
				classes.push({id: id, sgenre: node.genre, slocation: node.location, value: node.count, gy: node.lat, gx: node.lon}); //set as layer 9				
			} 
		}
	} 
	recurse(null, jsonData);
	/*classes.sort(function(a, b){
 		return b.value - a.value;
	})*/
	return {children: classes};
}

function lookForFirstYear(genre) {
	var d = jsonData.children;
	var years = [];
	for ( i=0,l=d.length; i < l;i++) {
		if (d[i].genre == genre) {
			years.push(parseInt(d[i].year));
		}
	}
	return Math.min.apply( Math, years );
}


function swapImage(gId,source) 
{
	gname=gId;
	
	temp1 = source;
	temp3 = "Images/" + gname + "C.gif";
	temp4= "Images/" + gname + "UC.gif";
	temp5=temp1.split("/");
	temp6=temp5[temp5.length-2]+"/"+temp5[temp5.length-1];
	temp7="Images/" + gname + "2.gif";
	if (count<3)
	{
			if (temp6 == temp7)
			{
				document.getElementById(gId).src ="Images/" + gname + "C.gif";
				count++;
				flag[gId]=0;
				
			}
	}
		if (temp6==temp3)
		{
				document.getElementById(gId).src = "Images/" + gname + "UC.gif";
				count--;
				flag[gId]=1;
		}
} 
function imgChange(img, IID) 
{
	if (flag[IID]==1)
	{ 
		document.getElementById(IID).src = img;
	} 
}

function hash(value) 
{
	return jQuery.trim(value.genre + value.location).replace(/\s/g, "").toLowerCase();
}

hash.current = 0;

var timer = undefined;
function playClick() {
  if (timer) {
    stop();
  } else {
    //if (yearBtn == 2011) yearBtn = 1921;
    $('#slider').slider('value', yearBtn);
    $('#play').attr("src", 'images/pause1.png');
    timer = setInterval(function() {
      yearBtn++;
      if (yearBtn >= 2011) stop();
      $('#slider').slider('value', yearBtn);
    }, 850);
  }
}
// Stop the animation
function stop() {
  clearInterval(timer);
  timer = undefined;
  $('#play').attr("src", 'images/play1.png');
}

/*
Array.max = function( array ){
    return Math.max.apply( Math, array );
};
Array.min = function( array ){
    return Math.min.apply( Math, array );
};*/