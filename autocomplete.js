function searchInit() {
		var d = forcedGraph.nodesHash;
		var autoData = [];
		for (var i in d) {
			autoData.push( { 'value' : i, 'label' : d[i] })
		}
		
		$( "#search" ).autocomplete({
			minLength: 1,
			source: autoData,
			focus: function( event, ui ) {
				$( "#search" ).val( ui.item.label );
				return false;
			},
			select: function( event, ui ) {
				$( "#search" ).val( ui.item.label );
				d = {};
				d.id = parseInt(ui.item.value);
				nodeClick(d);		
				yearBtn = lookForFirstYear(ui.item.label);				
				setTimeout(function() { $('#slider').slider('value', yearBtn); }, 200);
				return false;
			}
		})
		.data( "autocomplete" )._renderItem = function( ul, item ) {
			return $( "<li></li>" )
				.data( "item.autocomplete", item )
				.append( "<a>" + item.label + "</a>" )
				.appendTo( ul );
		};
}