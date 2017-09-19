/**
 *	Last.fm top artists widget
 *	version -1
 *	Author: skratz17
 *	Licensed under the Spencer is Better than Dan license
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
	$.ajax(
		{ 
			url: "https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=" + this.username + "&api_key=" + this.apiKey + "&period=" + this.period + "&limit=" + this.limit + "&format=json",
			success: this.setData,
			context: this
		}
	 )
}

/**
 * Create all the DOM elements for the list, append to target DOM element
 * @param {String} [id] - the target DOM element, defaults to this.targetElemId
 */ 
TopArtists.prototype.show = function(id) {
	id = id || this.targetElemId;
	var $targetElem = $(id);
	var $artistTable = $("<table>", {"class": "topArtistsTable"});
	var imageSize = ImageSizeEnum[this.imageSize];

	for(var i = 0; i < this.artists.length; i++) {
		var artist = this.artists[i];

		/* create DOM elements for list */
		var $artistTableRow = $("<tr>", {"class": "topArtistsTableRow"});
		var $artistImageCell = $("<td>", {"class": "topArtistsImageCell"});
		var $artistImage = $("<img>", {
			"class": "topArtistsImage",
			"src": artist.image[imageSize]["#text"]});
		var $artistNameCell = $("<td>", {
			"class": "topArtistsName",
			"text": artist.name});
		var $artistName = $("<p>", {"class": "topArtistsNameCell"});

		/* append to each other and to DOM */
		$artistNameCell.append($artistName);
		$artistImageCell.append($artistImage);
		$artistTableRow.append($artistImageCell);
		$artistTableRow.append($artistNameCell);
		$artistTable.append($artistTableRow);
		$targetElem.append($artistTable);
	}
}
