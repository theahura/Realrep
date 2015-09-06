/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for viewing correlations
*/

var global_correlationTopFive;
var global_correlationData;

function loadMap() {

	global_correlationTopFive = [];

	socket.emit('clientToServer', {
		name: 'getHashtag',
		hash: $('#SearchForCorrelation').val()
	}, function(data, err) {

		var dataObj = {};

		delete data['userID'];
		delete data['hashtag'];

		for(key in data) {
			if('S' in data[key]) {
				dataObj[key] = data[key].S
			}
			else if('N' in data[key]) {
				if(data[key].N === '0')
					continue;

				dataObj[key] = parseInt(data[key].N)			
			}
		}

		global_correlationData = dataObj;

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

			nodes.push({id: index + 1, label: dataObj[sortedKeys[index]], title: sortedKeys[index], value: dataObj[sortedKeys[index]]});
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

      	network = new vis.Network(container, data, options);
	});
}


