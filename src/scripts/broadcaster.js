/* Global */

var broadcaster = {
	initialize: function() {
		broadcaster.watchPlays();
	},
	watchPlays: function() {
		// Set up an observer to watch for new play events in the DOM
		var plays = document.querySelector('#plays'),
			observer = new MutationObserver(function(mutations){
				mutations.forEach(function(mutation){
					if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
						var $thisPlay = $(mutation.addedNodes[0]),
							playEvent = {};

						playEvent.name = $thisPlay.find('.eventName').html(),
						playEvent.description = $thisPlay.find('.eventDesc').html(),
						playEvent.period = $thisPlay.find('.period').html(),
						playEvent.team = $thisPlay.find('.team').html();
					}
				});
			}),
			config = { 
				childList: true,
				subtree: true, 
				attributes: true,
				attributeOldValue: true,
				characterData: true,
				characterDataOldValue: true
			};
		
		observer.observe(plays, config);
	}
};

$(document).ready(function() {
	broadcaster.initialize();
});