/**
    @author: Amol Kapoor
    @date: 9-5-15
    @version: 0.1

    Description: All UI effects go here
*/

$( document ).ready( function() {
    $("#loginLogo").fadeIn("slow");
    $("#loginLogo").animate({width : "800px", height : "550px"});
    $(".flavortext").delay( 800 ).fadeIn(1500);

});

$( document ).keydown(function(e) {
    switch(e.which) {
        case 38: // up
            scrollPage("#upperPanel");
        break;

        case 40: // down
            scrollPage("#lowerPanel");
        break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});

$('#ProfilePicture').click(function() { 
    $('.judgrpage').slideToggle();
    $('.other-profile-page').slideToggle(function() {
        loadOtherProfileMap();
    });
});


$('.temp').click(function() {
    $('.self-profile-page').slideToggle();  
    $('.judgrpage').slideToggle();
});

$('#view-judgr').click(function() {
    $('.self-profile-page').slideToggle();
    $('.judgrpage').slideToggle();
})

$('.view-correlator').click(function() {
    $('.self-profile-page').slideToggle();
    $('.correlation-page').slideToggle();
});

$('.correlation-to-profile').click(function() {
    $('.correlation-page').slideToggle();
    $('.self-profile-page').slideToggle();
    loadProfileMap();               
});

$('.judgr-to-profile').click(function() {
    $('.judgrpage').slideToggle();
    $('.self-profile-page').slideToggle();
    loadProfileMap();               
})

$('.otherprofile-to-judgr').click(function() {
    $('.other-profile-page').slideToggle();
    $('.judgrpage').slideToggle();
});



function postLogin() {
    $('.loginpage').slideToggle();
    $('.self-profile-page').slideToggle(); 
    loadProfileMap();               
}

function postLoadUser(fbID, hashtagList) {

    FBgetProfilePicture(fbID, function(url) {
        $("#ProfilePicture").attr("src", url);
    });

    var tag = hashtagList[Math.floor(Math.random()*hashtagList.length)];
    $(".hashtag").html(tag);
}

function postInitTags() {
    console.log("close");
    $('.initial-tag-page').slideToggle();
    $('.self-profile-page').slideToggle();  
}

function getInitTags() {
    $('.initial-tag-page').slideToggle();
    $('.loginpage').slideToggle();
}




$('#tag-submit').click(function() {
    var tag1 = $("#tag-field1").val();
    var tag2 = $("#tag-field2").val();
    var tag3 = $("#tag-field3").val();
    var tag4 = $("#tag-field4").val();
    var tag5 = $("#tag-field5").val();
    var tag6 = $("#tag-field6").val();
    
    if (tag1 && tag2 && tag3 && tag4 && tag5 && tag6) {
        var incomingObj = {
            name: 'addUser',
            hash: global_ID,
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
                postInitTags();
                loadProfileMap();
            }
        });
    }
    else {
        alert("FILL IN ALL THE BOXES, YO!!");
    }
});

function scrollPage(panelID) {
    $('body').animate({
        scrollTop: $(panelID).offset().top
    }, 1000);
}

$('#FacebookLogin').click(function() {
    scrollPage("#lowerPanel");
});
