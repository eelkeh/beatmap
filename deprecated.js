function classes(jsonData) 
{	//define containers for data to be organized in
	var classes = []; //primary data container

	function recurse(name, node)
	{
		if (node.children) //if node has children, go deeper
		{
			node.children.forEach(function(child) {recurse(node.name, child); }); //for each of the childred, go even deeper
		}

		else if ( parseInt(node.year) === yyyy)  //once no more children, check year, genre, location, layer value(similar to z-index) and set into data array (classes[])
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
					
						if (templon<=-45 && templat>=15) //North America (expanded)
						{
							var scale = Math.floor((8/1020)*r1);
							templon=templon*scale; //spread the long-lat coords in a wider area
							templat=templat*scale;
							node.lon=(r1/2)+((500/1020)*r1)+templon; //position it on the screen pixel area with a manually tuned center point for each continent
							node.lat=(r2/2)+((225/540)*r2)-templat;
						}
						
						if (templon>=-120 && templon<=-30 && templat<=30 && templat>=-60) //South America (condensed)
						{
							var scale = Math.floor((3/1020)*r1);
							templon=templon*scale;
							templat=templat*scale;
							node.lon=(r1/2)+templon;
							node.lat=(r2/2)+((90/540)*r2)-templat;						
						}
						if (templon>-45 && templon<45 && templat<90 && templat>-30) //Europe (expanded)
						{
							var scale = Math.floor((6.5/1020)*r1);
							templon=templon*scale;
							templat=templat*scale;
							node.lon=(r1/2)+((100/1020)*r1)+templon;
							node.lat=(r2/2)+((150/540)*r2)-templat;
						}
						if (templon>45 && templon<180 && templat<90 && templat>-15) //Asia (condensed)
						{
							var scale = Math.floor((2/1020)*r1);
							templon=templon*scale;
							templat=templat*scale;
							node.lon=(r1/2)+((200/1020)*r1)+templon;
							node.lat=(r2/2)+((20/540)*r2)-templat;
						}
						if (templon>105 && templon<180 && templat<-15 && templat>-50) //Australia (condensed)
						{
							var scale = Math.floor((2/1020)*r1);
							templon=templon*scale;
							templat=templat*scale;
							node.lon=(r1/2)+((120/1020)*r1)+templon;
							node.lat=(r2/2)+((100/540)*r2)-templat;
						}
						if (templon>-25 && templon<60 && templat<65 && templat>-40) //Africa (condensed)
						{
							var scale = Math.floor((2/1020)*r1);
							templon=templon*scale;
							templat=templat*scale;
							node.lon=(r1/2)+templon;
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
	//console.log(classes);
	/*classes.sort(function(a, b){
 		return b.value - a.value;
	})*/
	return {children: classes};
}