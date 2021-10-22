/**
 *	Last.fm top artists widget
 *	version -1
 *	Author: skratz17
 *	Licensed under the Spencer is Better than Dan license
 *	skratz17 is god, kvistikor and drizzy are but babies
 *	quick explanation of how to use is included at bottom of file
 */

/**
 * ImageSizeEnum - used to provide mapping between image size text name and location of image in artist array
 */
let ImageSizeEnum = {
	small: 0,
	medium: 1,
	large: 2,
	extralarge: 3,
	mega: 4
};

/** 
 * TopArtists constructor
 * @param {String} username - lastFm username for top artist list
 * @param {String} apiKey - lastFm API key for that user
 * @param {String} targetElemId - id of DOM element to append top artist list to
 * @param {String} [imageSize] - small | medium | large | extralarge | mega, defaults to medium
 * @param {String} [period] - overall | 7day | 1month | 3month | 6month | 12month - The time period over which to retrieve top artists for, defaults to overall
 * @param {Number} [limit] - number of top artists to fetch, defaults to 5
 */
function TopArtists(username, apiKey, targetElemId, imageSize, period, limit) {
	this.username = username;
	this.apiKey = apiKey;
	this.targetElemId = targetElemId;
	this.imageSize = imageSize || "medium";
	this.period = period || "overall";
	this.limit = limit || 5;
}

/**
 * Load the top artist data from lastFm. Call this after initalizing the TopArtists object.
 */
TopArtists.prototype.load = function() {
	$.ajax({ 
		url: "https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=" + this.username + "&api_key=" + this.apiKey + "&period=" + this.period + "&limit=" + this.limit + "&format=json",
		success: this.setData,
		context: this
	});
}

/**
 * Set the data returned from lastFm API call and call show to create the list
 * @param {Object} data - data returned from API call
 */
TopArtists.prototype.setData = function(data) {
	this.artists = data.topartists.artist;
	this.show();
}

/**
 * Create all the DOM elements for the list, append to target DOM element
 * @param {String} [id] - the target DOM element, defaults to this.targetElemId
 */ 
TopArtists.prototype.show = function(id) {
	/* get target element */
	id = id || this.targetElemId;
	var $targetElem = $(id);

	/* create period dropdown */
	var $periodSelectDivWrapper = $("<div>", {"class": "select-wrapper"});
	var $periodSelect = $("<select>", {
		"class": "periodSelect",
		"id": "periodSelect"
	});
	var periods = ["Last Week", "Last Month", "Last 3 Months", "Last 6 Months", "Overall"];
	var periodValues = ["7day", "1month", "3month", "6month", "overall"];
	for(var i = 0; i < periods.length; i++) {
		var $periodOption = $("<option>", {
			"class": "periodOption",
			"value": periodValues[i],
			"text": periods[i]
		});
		if(periodValues[i] === this.period) {
			$periodOption.attr("selected", "selected");
		}
		$periodSelect.append($periodOption);
	}
	$periodSelectDivWrapper.append($periodSelect);
	$targetElem.append($periodSelectDivWrapper);
	$periodSelect.change($.proxy(this._onPeriodSelectChange, this));

	/* create the top artists table */
	var $artistTableDivWrapper = $("<div>", {"class": "topArtistsDivWrapper"});
	var $artistTable = $("<table>", {"class": "topArtistsTable"});
	var imageSize = ImageSizeEnum[this.imageSize];
	for(let value of this.artists) {
		var artist = this.artists[value];

		/* create DOM elements for the top artists table rows */
		var $artistTableRow = $("<tr>", {"class": "topArtistsTableRow"});
		var $artistImageCell = $("<td>", {"class": "topArtistsImageCell"});
		var $artistImage = $("<img>", {
			"class": "topArtistsImage",
			"src": artist.image[imageSize]["#text"]
		});
		var $artistNameCell = $("<td>", {"class": "topArtistsNameCell"});
		var $artistNameHeader = $("<h3>");
		var $artistName = $("<a>", {
			"class": "topArtistsName",
			"href": artist.url,
			"text": artist.name
		});
		var $playCount = $("<p>", {
			"class": "topArtistsPlayCount",
			"text": artist.playcount + " plays"
		});

		/* append to each other and to target element */
		$artistNameHeader.append($artistName);
		$artistNameCell.append($artistNameHeader);
		$artistNameCell.append($playCount);
		$artistImageCell.append($artistImage);
		$artistTableRow.append($artistImageCell);
		$artistTableRow.append($artistNameCell);
		$artistTable.append($artistTableRow);
	}
	$artistTableDivWrapper.append($artistTable);
	$targetElem.append($artistTableDivWrapper);
}

/**
 * Reload function - wipe out the DOM elements generated from the widget and reload according to widget's current state.
 */
TopArtists.prototype.reload = function() {
	$(this.targetElemId).empty();
	this.load();
}

/**
 * Event handler for time period dropdown change. Update the widget's currently-selected period and reload.
 * @param {Object} event - the change event
 */
TopArtists.prototype._onPeriodSelectChange = function(event) {
	var selectedPeriod = $("#periodSelect").val();
	this.period = selectedPeriod;
	this.reload();
}

/* Quick explanation of how to use w/ examples
 *
 * So to use this you have to initialize a TopArtists object and then call its load function on the page you want to put the widget on. So, say I have some page called index.html and I want the widget to load under the div that has the id of "topArtists". I'd do this on index.html:
 *
 * 1) include this script:
 * <script src="<path to this script>"></script>
 *
 * 2) after including this script, make a call to initialize the widget object, in a <script> element following the one that includes this script
 *	var topArtistsWidget = new TopArtists("<username>", "<apiKey>", "#topArtists");
 *	note: there are also some optional params you can pass into this, so for instance is you want the widget to default to the top 10 artists of the last 7 days, you can pass in params for those. see the documentation of the constructor for more details.
 *
 *	3) after that you just call load on the object you instantiated and the widget will get the data from LastFm and render under the DOM element whose id you passed in as the third argument to the constructor:
 *
 *	topArtistsWidget.load();
 */
