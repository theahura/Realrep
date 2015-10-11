/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for viewing correlations
*/

function correlation_loadMap() {

	socket.emit('clientToServer', {
		name: 'getHashtag',
		hash: $('#SearchForCorrelation').val()
	}, function(data, err) {

		var dataObj = {};

		delete data['userId'];
		delete data['hashtag'];

		for(key in data) {
			if('S' in data[key]) {
				dataObj[key] = data[key].S
			}
			else if('N' in data[key]) {
				if(parseInt(data[key].N) <= 0)
					continue;

				dataObj[key] = parseInt(data[key].N)			
			}
		}

		var sortedKeys = Object.keys(dataObj).sort(function(a,b){return dataObj[a]-dataObj[b]});

		var color = 'gray';
		var len = undefined;

		var nodes = [];
		var edges = [];

		nodes.push({id: 0, label: $('#SearchForCorrelation').val(), value: dataObj[sortedKeys[sortedKeys.length - 1]] + 1});

		for(index in sortedKeys) {
			if(sortedKeys[index] === $('#SearchForCorrelation').val())
				continue;

			index = parseInt(index);

			nodes.push({id: index + 1, label: dataObj[sortedKeys[index]] + " - " + sortedKeys[index], value: dataObj[sortedKeys[index]]});
			edges.push({from: index + 1, to: 0});
		}


	    // Instantiate our network object.
	    var container = document.getElementById('CorrelationNetwork');
	    var data = {
	        nodes: nodes,
	        edges: edges
	    };
	    var options = {
	        nodes: {
	            shape: 'dot',
	          	scaling:{
	            	label: {
              			min:20,
              			max:400
	            	}
	          	}
        	}
    	};

      	var network = new vis.Network(container, data, options);
		
		network.on("afterDrawing", function() {
      		if(network.getScale() !== 1.5)
	      		network.focus(0, {scale: 1.5, offset: {y:-20}});
      	});
	});
}

//----------------------------------------------------------------------------------------------------------------------------
//UI GOES HERE
//----------------------------------------------------------------------------------------------------------------------------

$('.correlation-to-profile').click(function() {
    $('.correlation-page').slideToggle();
    $('.self-profile-page').slideToggle();
    selfprofile_loadProfileMap();               
});

$('.correlation-form').submit(function(event) {
	event.preventDefault();
	correlation_loadMap();
});