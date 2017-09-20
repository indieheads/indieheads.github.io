/**
 *	Last.fm top artists widget
 *	version -1
 *	Author: skratz17
 *	Licensed under the Spencer is Better than Dan license
 *	skratz17 is god, kvistikor and drizzy are but babies
 */

/**
 * ImageSizeEnum - used to provide mapping between image size text name and location of image in artist array
 */
ImageSizeEnum = {
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
 * Set the data returned from lastFm API call and call show to create the list
 * @param {Object} data - data returned from API call
 */
TopArtists.prototype.setData = function(data) {
	this.artists = data.topartists.artist;
	this.show();
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
	var $artistTable = $("<table>", {"class": "topArtistsTable"});
	var imageSize = ImageSizeEnum[this.imageSize];
	for(var i = 0; i < this.artists.length; i++) {
		var artist = this.artists[i];

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
	$targetElem.append($artistTable);
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
