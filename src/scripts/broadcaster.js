/**
 * Broadcaster
 * @toddlawton
 *
 * A Chrome extension to live feed NHL game data via WebSocket.
 */

var socketClient = io.connect('http://localhost:3000/'),
	broadcaster = {

	/**
	 * Run main functions of the extension
	 */
	initialize: function() {
		socketClient.emit('connectMessage', 'Socket client successfully connected.');
		broadcaster.watchPlays(socketClient);
	},

	/**
	 * Observe and pull data from play events as they appear
	 */
	watchPlays: function() {

		// Set up an observer to watch for new play events in the DOM
		var plays = document.querySelector('#plays #allPlaysScroll');

		// Take the game time and current period on load so only new plays are emitted
		var startTime = document.querySelector('.status .time').innerHTML,
			currentPeriod = document.querySelector('.status .prd').innerHTML;

		// Take only the integer in the string, '2nd' for example
		startPeriod = parseInt(currentPeriod.trim().charAt(0));

		// Convert start time into seconds for easier comparison with current time
		startTimeSplit = startTime.split(':');
		startTimeSeconds = parseInt((startTimeSplit[0]) * 60 + (+startTimeSplit[1]));
		startTimeSeconds = 1200-startTimeSeconds;

		var observer = new MutationObserver(function(mutations){
				mutations.forEach(function(mutation){
					if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
						var $thisPlay = $(mutation.addedNodes[0]),
							playEvent = {};

						// Fetch the data from each added play
						playEvent.name = $thisPlay.find('.eventName').html();
						playEvent.description = $thisPlay.find('.eventDesc').html();
						playEvent.team = $thisPlay.find('.team').html();
						playEvent.period = $thisPlay.find('.period').html();

						// Extract the time in MM:SS from the string
						playTime = String(playEvent.period);
						playTime = playTime.substr(playTime.length-5, playTime.length);

						// Convert play time into seconds for easier comparison with start time
						playTimeSplit = playTime.split(':');
						playTimeSeconds = parseInt((playTimeSplit[0]) * 60 + (+playTimeSplit[1])); 
						playTimeSeconds = 1200-(1200-playTimeSeconds);
						playEvent.time = playTimeSeconds; 

						// Extract the integer value of the play period
						playPeriod = String(playEvent.period);
						playPeriod = parseInt(playPeriod.trim().charAt(0));
						playEvent.period = playPeriod;

						// If the play occured after load time send to server
						if (playPeriod === startPeriod && playTimeSeconds >= startTimeSeconds || playPeriod > startPeriod) {
							if (playEvent.name !== null && playEvent.name !== 'null') {
								broadcaster.emitPlay(playEvent.name, playEvent);								
							}
						}
					}
				});
			}),
			// Configure the observer
			config = { 
				childList: true,
				subtree: true, 
				attributes: true,
				attributeOldValue: true,
				characterData: true,
				characterDataOldValue: true
			};
		

		// Begin observing the plays container element
		observer.observe(plays, config);
	},

	/**
	 * Broadcast the play data to the WebSocket
	 * @param  {string} Type of play 'goal, miss, hit, faceoff'
	 * @param  {object} Object containing the attributes of the play
	 */
	emitPlay: function(type, playEvent) {
		socketClient.emit('playEvent', playEvent);
	}
};

$(document).ready(function() {
	broadcaster.initialize();
});