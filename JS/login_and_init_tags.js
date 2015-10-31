/**
	@author: Amol Kapoor
	@date: 10-5-15
	@version: 0.1

	Login and Init panels
*/


/**
    Mechanism to call the past user data. Logs into facebook, emits getProfile with the facebook userId on callback, and
    triggers UI change if successful login on both Facebook AND RealRep
*/
function loginPastUser(callback) {
    selfprofile_login(function() {
        socket.emit('clientToServer', {
            name: 'getProfile',
            hash: global_ID
        }, function(data, err) {

            if(!data) {
                if(!callback)
                    alert("Fill out the tags and create a new user");
                else 
                    callback();

                return;
            }
            else {
                postLogin();
            }
        });
    });
}


/**
    Mechanism to sign up new users. Logs into facebook, generates a set of tags based on user input, sends those tags to server, 
    and triggers UI change if everything is successful. If the tags are not all full, attempts to log in as old user. 
*/
function loginNewUser() {
    
    var tag1 = $("#tag-field1").val();
    var tag2 = $("#tag-field2").val();
    var tag3 = $("#tag-field3").val();
    var tag4 = $("#tag-field4").val();
    var tag5 = $("#tag-field5").val();
    var tag6 = $("#tag-field6").val();

    function notEqual(array) {
       for(var i = 0; i < array.length; i++) {
            for(var j = i; j < array.length; i++) {
                if(array[i] === array[j]) {
                    return false;
                }
            }
       }

       return true;             
    }

    selfprofile_login(function() {

        loginPastUser(function() {

            if (tag1 && tag2 && tag3 && tag4 && tag5 && tag6) {

                var tagArray = [tag1, tag2, tag3, tag4, tag5, tag6];

                if(!notEqual(tagArray)) {
                    alert("Please select different tags for each value");
                    return;
                }

                if(tagArray.every)

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
      

                socket.emit('clientToServer', incomingObj, function(data, err) {
                    if(err) {
                        console.log(err);
                    }
                    else {
                        console.log(incomingObj);
                        postLogin();
                    }
                });
            }
            else {
                alert("Please fill out all of the tags before continuing");
            }
     
        });

    });
}


//----------------------------------------------------------------------------------------------------------------------------
//UI GOES HERE
//----------------------------------------------------------------------------------------------------------------------------


/**
    Click binding so that when hitting the downbounce arrow, the screen scrolls down 
*/
$('#theArrow').click(function() {
    scrollPage(".initial-tag-page");
});

/**
    Triggers sign-in process for old users. If data cannot be found for a FB userID, requests a new signup
*/
$("#old-user-login").click(function() {
    loginPastUser();
});

/**
    Opens the init tag div
*/
$('#new-user-login').click(function() {
    $(".old-user-signup").fadeOut(function() {
        $(".new-user-signup").fadeIn();
    });
});

/**
    Sets up a new user, or, if an old user exists, signs in the old user. 
*/
$('#tag-submit').click(function() {
    loginNewUser();
});

/**
    After signing in or signing up, opens up the user's personal map page
*/
function postLogin() {
    $(".login-page").slideToggle();
    $(".initial-tag-page").slideToggle();
    $(".self-profile-page").slideToggle(function() {
        selfprofile_loadProfileMap();
    });
}

/**
    Key binding for key up and key down with the downbounce arrow
*/
$( document ).keydown(function(e) {
    switch(e.which) {
        case 38: // up
            scrollPage(".login-page");
        break;

        case 40: // down
            scrollPage(".initial-tag-page");
        break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});
