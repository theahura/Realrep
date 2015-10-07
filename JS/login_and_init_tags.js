/**
	@author: Amol Kapoor
	@date: 10-5-15
	@version: 0.1

	Description: Hooks to the actual UI
*/

function login_init_setUserProfile(data) {

	delete data['userId']

	var sortedKeys = Object.keys(data).sort(function(a,b){return data[a]-data[b]});

	var max = data[sortedKeys[sortedKeys.length - 1]];
	console.log(max)
	var divisor = max/100;

	for(var i = 0; i < sortedKeys.length; i++) {

    	$(".friends-data > tbody:last-child").append(
    		"<tr id=\"DataBar-" + i + "\">"+
				"<td class=\"hashtag-name\">" + 
				"</td>"+
				"<td class=\"bar-container\">"+
					"<div class=\"bar\"> </div>"+
				"</td>"+
			"</tr>");

    	if (data[sortedKeys[i]]/divisor < 8) {
    		$('#DataBar-' + i).find('.bar').html(data[sortedKeys[i]]);
    	}
    	else {
    		$('#DataBar-' + i).find('.bar').html(data[sortedKeys[i]] + " rep");
    	}

    	$('#DataBar-' + i).find('.hashtag-name').html(sortedKeys[i]);
    	$('#DataBar-' + i).find('.bar').width(data[sortedKeys[i]]/divisor + "%");
	}
}

function login_init_FBlogin(callback) {
	//fb.js
	FBlogin(function(id) {

		global_ID = id;

		var deferred_name = new $.Deferred();
		var deferred_friends = new $.Deferred();

		FBgetName(id, function(name) {
			global_name = name;
			$('.profile label').html(global_name);

			socket.emit('clientToServer', {
				name: 'checkUser', 
				hash: global_ID
			}, function(data) {
				
				var dataObj = stripDynamoSettings(data);

				deferred_name.resolve();
			});
		});

		FBgetFriends(id, function(list) {
			global_friendsList = list; 
			global_friendsListUnmodified = list;
			deferred_friends.resolve();
		});

		$.when.apply(deferred_name, deferred_friends).done(function() {

			if(callback)
				callback();

		});
	});

}

function login_init_loadProfileMap() {

	socket.emit('clientToServer', {
		name: 'getProfile',
		hash: global_ID
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

		nodes.push({id: 0, label: global_name, value: dataObj[sortedKeys[sortedKeys.length - 1]] + 1});

		for(index in sortedKeys) {
			if(sortedKeys[index] === global_name)
				continue;

			index = parseInt(index);

			nodes.push({id: index + 1, label: dataObj[sortedKeys[index]] + " - " + sortedKeys[index], value: dataObj[sortedKeys[index]]});
			edges.push({from: index + 1, to: 0});
		}


	    // Instantiate our network object.
	    var container = document.getElementById('ProfileNetwork');
	    var data = {
	        nodes: nodes,
	        edges: edges
	    };
	    var options = {
	        nodes: {
	            shape: 'dot',
	          	scaling:{
	            	label: {
	              		min:50,
	              		max:200
	            	}
	          	}
        	}
    	};

      	var network = new vis.Network(container, data, options);

      	network.on("afterDrawing", function() {
      		if(network.getScale() !== 1.0)
      			network.focus(0, {scale: 1.0, offset: {y:20}});
      	});
	});
}

//----------------------------------------------------------------------------------------------------------------------------
//UI GOES HERE
//----------------------------------------------------------------------------------------------------------------------------


$("#old-user-login").click(function() {
    login();
});

$('#tag-submit').click(function() {

    var tag1 = $("#tag-field1").val();
    var tag2 = $("#tag-field2").val();
    var tag3 = $("#tag-field3").val();
    var tag4 = $("#tag-field4").val();
    var tag5 = $("#tag-field5").val();
    var tag6 = $("#tag-field6").val();

    login(function() {
        //NEED TO ADD CHECK TO MAKE SURE GLOBAL ID ISN'T ALREADY REFERENCED
        if (tag1 && tag2 && tag3 && tag4 && tag5 && tag6) {

            var incomingObj = {
                name: 'addUser',
                hash: global_ID
            }

            incomingObj[$("#tag-field1").val()] = 10;
            incomingObj[$("#tag-field2").val()] = 10;
            incomingObj[$("#tag-field3").val()] = 10;
            incomingObj[$("#tag-field4").val()] = 10;
            incomingObj[$("#tag-field5").val()] = 10;
            incomingObj[$("#tag-field6").val()] = 10;
            
            console.log("top");
            console.log(incomingObj);
            console.log(global_ID);
            console.log("bottom");

            socket.emit('clientToServer', incomingObj, function(data, err) {
                if(err) {
                    console.log(err);
                }
                else {
                    console.log(incomingObj);
                    postInitTags();
                    loadProfileMap();
                }
            });

            postLogin();

        }
        else {

            socket.emit('clientToServer', {
                name: 'getProfile',
                hash: global_ID
            }, function(data, err) {

                if(!data) {
                    alert("Fill out the tags");
                    return;
                }
                else {
                    postInitTags();
                    loadProfileMap();         
                }
            });
        }
    });
});

function postInitTags() {
    console.log("close");
    $('.initial-tag-page').slideToggle();
    $('.self-profile-page').slideToggle();
}

function postLogin() {
    $(".login-page").slideToggle();
    $(".initial-tag-page").slideToggle();
    $(".self-profile-page").slideToggle();
    loadProfileMap();
}

$( document ).keydown(function(e) {
    switch(e.which) {
        case 38: // up
            scrollPage(".login-page");
        break;

        case 40: // down
            scrollPage(".initial-tag-page panel");
        break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});


$('#theArrow').click(function() {
    scrollPage(".initial-tag-page panel");
});
