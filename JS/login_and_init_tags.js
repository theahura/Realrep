/**
	@author: Amol Kapoor
	@date: 10-5-15
	@version: 0.1

	Login and Init panels
*/



//----------------------------------------------------------------------------------------------------------------------------
//UI GOES HERE
//----------------------------------------------------------------------------------------------------------------------------


$("#old-user-login").click(function() {
    selfprofile_login();
});

$('#tag-submit').click(function() {

    var tag1 = $("#tag-field1").val();
    var tag2 = $("#tag-field2").val();
    var tag3 = $("#tag-field3").val();
    var tag4 = $("#tag-field4").val();
    var tag5 = $("#tag-field5").val();
    var tag6 = $("#tag-field6").val();

    selfprofile_login(function() {
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
                    selfprofile_loadProfileMap();
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
                    selfprofile_loadProfileMap();         
                }
            });
        }
    });
});

function postInitTags() {
    $('.initial-tag-page').slideToggle();
    $('.self-profile-page').slideToggle();
}

function postLogin() {
    $(".login-page").slideToggle();
    $(".initial-tag-page").slideToggle();
    $(".self-profile-page").slideToggle();
    selfprofile_loadProfileMap();
}

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


$('#theArrow').click(function() {
    scrollPage(".initial-tag-page");
});
