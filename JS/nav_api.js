/**
	@author: Amol Kapoor
	@date: 1-4-16
	@version: 0.1

	Description: API to hook into HTML5 history api. Handles changing pages as well. 
*/



/**
	Makes sure all other pages are closed besides passed one
**/
function ensureOthersAreClosed(pageToLoad) {
	for(key in mapReference) {
		if(key === pageToLoad) 
			continue;
		
		if(!$('.' + key).is(":hidden")) {
			$('.' + key).slideToggle();
		}
	}
}

/**
	Handles changing pages, includes forward/next button magic
**/
function changePage(newPageClass, oldPageClass, mapData, pageState, callback, onNavButton) {

    $('.' + newPageClass).slideToggle(function() {

    	if(mapReference[newPageClass] && mapData) {
       		loadProfileMap('.' + mapReference[newPageClass], mapData);               
    	}

    	if(oldPageClass && mapReference[oldPageClass]) 
    		$('.' + mapReference[oldPageClass]).empty();

    	ensureOthersAreClosed(newPageClass);

    	if(callback)
	    	callback();
		
		if(!onNavButton) {

			global_state.nextPage = newPageClass;
			history.replaceState(global_state, "");

			global_state.prevPage = global_state.currentPage;
			global_state.currentPage = newPageClass;
			global_state.nextPage = null;
			document.title = docTitle + nameReference[global_state.currentPage];

			stackLocation++;

			global_state.index = stackLocation;

			history.pushState(global_state, "");
		}
			
    });
}


window.onpopstate = function(event) {

	if(!event.state || !event.state.currentPage)
		return;

	var state = event.state;

	console.log(event.state)

	var pageToLoad, pageToHide;

	//if going backwards, else going forwards
	if(state.index < stackLocation) {
		pageToLoad = state.currentPage;
		pageToHide = state.nextPage;		
	} else {
		pageToLoad = state.currentPage;
		pageToHide = state.prevPage;	
	}

	alert(pageToLoad)
	alert(pageToHide)
	alert(state.index)
	alert(stackLocation)

	global_state = state;
	document.title = docTitle + nameReference[global_state.currentPage];

	if (pageToLoad === 'initial-tag-page') {
		changePage(pageToLoad, pageToHide, null, null, null, true);
    	$(".login-page").slideToggle();
		return;
	} 

	if(pageToLoad === 'self-profile-page') {

		changePage(pageToLoad, pageToHide, global_ID, null, null, true);

	} else if (pageToLoad === 'correlation-page') {
		changePage(pageToLoad, pageToHide, null, null, null, true);

		//load hashtag value from global_pageState

	} else if (pageToLoad === 'other-profile-page') {
		currentLoadedFriend = state.pageState.loadedFriend;

		changePage(pageToLoad, pageToHide, currentLoadedFriend.id, null, null, true);

		postLoadUser(currentLoadedFriend.id, currentLoadedFriend.fullHashtagList);

	} else if (pageToLoad === 'judgrpage') {
		changePage(pageToLoad, pageToHide, null, null, null, true);
		
		currentLoadedFriend = state.pageState.loadedFriend;

		postLoadUser(currentLoadedFriend.id, currentLoadedFriend.fullHashtagList);	
	} else if (pageToLoad === 'friend-network') {
		changePage(pageToLoad, pageToHide, null, null, null, true);

		if ($('.friend-network .friend-container li').length === 0)
			friendnetwork_loadFriends();
	}
};


