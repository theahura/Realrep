/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for other users
*/

function loadOtherProfileMap() {
	socket.emit('clientToServer', {
		name: 'getProfile',
		hash: global_nextID
	}, function(data, err) {

		console.log(data)
		console.log(err)

		var dataObj = {};

		delete data['userId'];
		delete data['hashtag'];

		console.log(data);

		for(key in data) {
			if('S' in data[key]) {
				dataObj[key] = data[key].S
			}
			else if('N' in data[key]) {
				if(parseInt(data[key].N) <= 0)
					continue;

				dataObj[key] = parseInt(data[key].N);			
			}
		}


		var sortedKeys = Object.keys(dataObj).sort(function(a,b){return dataObj[a]-dataObj[b]});

		var color = 'gray';
		var len = undefined;

		var nodes = [];
		var edges = [];


		FBgetName(global_nextID, function(name) {
			nodes.push({id: 0, label: name, value: dataObj[sortedKeys[sortedKeys.length - 1]] + 1});

			for(index in sortedKeys) {
				if(sortedKeys[index] === name)
					continue;

				index = parseInt(index);

				nodes.push({id: index + 1, label: dataObj[sortedKeys[index]], title: sortedKeys[index], value: dataObj[sortedKeys[index]]});
				edges.push({from: index + 1, to: 0});
			}

		    // Instantiate our network object.
		    var container = document.getElementById('OtherProfileMap');
		    var data = {
		        nodes: nodes,
		        edges: edges
		    };
		    var options = {
		        nodes: {
		            shape: 'dot',
		          	scaling:{
		            	label: {
		              			min:8,
		              			max:20
		            	}
		          	}
	        	}
	    	};

	      	var network = new vis.Network(container, data, options);

	      	network.on("afterDrawing", function() {
	      		network.focus(0, {scale: 2.0, offset: {y:20}});
	      	});
		});
	});
}
