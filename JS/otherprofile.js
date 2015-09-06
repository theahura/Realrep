/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for other users
*/

function loadOtherProfileMap() {
	alert();
	socket.emit('clientToServer', {
		name: 'getProfile',
		hash: global_nextID
	}, function(data, err) {

		alert("1")
		console.log(data)
		console.log(err)

		var dataObj = {};

		delete data['userID'];
		delete data['hashtag'];

		console.log(data);
		alert("2")

		for(key in data) {
			if('S' in data[key]) {
				dataObj[key] = data[key].S
			}
			else if('N' in data[key]) {
				if(data[key].N === '0')
					continue;

				dataObj[key] = parseInt(data[key].N);			
			}
		}

			alert("HELLO3");


		var sortedKeys = Object.keys(dataObj).sort(function(a,b){return dataObj[a]-dataObj[b]});

		var color = 'gray';
		var len = undefined;

		var nodes = [];
		var edges = [];

		alert("HELLO4");


		nodes.push({id: 0, label: global_name, value: dataObj[sortedKeys[sortedKeys.length - 1]] + 1});

		for(index in sortedKeys) {
			if(sortedKeys[index] === global_name)
				continue;

			index = parseInt(index);

			nodes.push({id: index + 1, label: dataObj[sortedKeys[index]], title: sortedKeys[index], value: dataObj[sortedKeys[index]]});
			edges.push({from: index + 1, to: 0});
		}

		alert("HELLO5");


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
		alert("HELLO6");

      	network = new vis.Network(container, data, options);

      	network.moveTo({
		  scale: 3.0
		});
	});
}
