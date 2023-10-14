
var SpotifyWebApi = require('spotify-web-api-js');
var api = new SpotifyWebApi();

async function getDisplayName(userId=null) {
	if (userId == null) {
		const thisUser = await api.getMe();
		return thisUser.display_name;
	}
	const user = await api.getUser(userId);
	return user.display_name;
}

class PlaylistInfo {
	constructor(json) {
		this.name = json.name;
		this.id = json.id;
		this.owner = json.owner.display_name;
		this.description = json.description;
		this.nTracks = json.tracks.total;
	}
	isCollaborative = false;
}


class PlaylistTrack {
	constructor(json) {
		this.name = json.track.name;
		this.id = json.track.id;
		// "2023-01-22T12:49:58Z"
		this.addedAt = new Date(json.added_at);
		this.addedBy = json.added_by.id;

		this.popularity = json.track.popularity;
		this.explicit = json.track.explicit;
		this.durationMs = json.track.duration_ms;
	}
}

async function getPlaylistTracks(playlistId) {
	var ret = [];
	var bi = 0;
	const limit = 50;
	while (true) {
		const json = await api.getPlaylistTracks(
			playlistId,
			{
				limit: limit,
				offset: bi,
			}
		);
		for (let i = 0; i < json.items.length; i++) {
			ret.push(new PlaylistTrack(json.items[i]));
		}
		if (json.next == null) {
			break;
		}
		bi += limit;
	}
	return ret;
}

async function playlistHasMultipleUsers(playlistId) {
	var bi = 0;
	const limit = 50;
	var firstUserId = null;
	while (true) {
		const json = await api.getPlaylistTracks(
			playlistId,
			{
				limit: limit,
				offset: bi,
			}
		);
		for (let i = 0; i < json.items.length; i++) {
			if (firstUserId == null) {
				firstUserId = json.items[i].added_by.id;
				continue;
			}
			if (firstUserId != json.items[i].added_by.id) {
				return true;
			}
		}
		if (json.next == null) {
			break;
		}
		bi += limit;
	}
	return false;
}

async function getUsersCollaborativePlaylists() {
	const thisUserId = (await api.getMe()).id;

	var ret = [];
	var promises = [];
	const limit = 50; // maximum allowed by api
	var bi = 0;
	while (true) {
		const json = await api.getUserPlaylists(
			thisUserId,
			{
				limit: limit,
				offset: bi,
			}
		);
		for (let i = 0; i < json.items.length; i++) {
			let prom = playlistHasMultipleUsers(json.items[i].id);
			prom.then((hasMultipleUsers) => {
				if (!hasMultipleUsers) {
					return;
				}
				var pi = new PlaylistInfo(json.items[i]);
				pi.isCollaborative = hasMultipleUsers;
				ret.push(pi);
			});
			promises.push(prom);
		}
		if (json.next == null) {
			break;
		}
		bi += limit;
		if (bi > 200) break;
	}
	await Promise.all(promises);
	// sort ret by name of playlist (alphabetical)
	ret.sort((a, b) => {
		if (a.name < b.name) return -1;
		else if (a.name > b.name) return 1;
		else return 0;
	});
	return ret;
}

module.exports = {
	SpotifyWebApi: api,
	PlaylistInfo: PlaylistInfo,
	setAccessToken: api.setAccessToken,
	getDisplayName: getDisplayName,
	getUsersCollaborativePlaylists: getUsersCollaborativePlaylists,
	getPlaylistTracks: getPlaylistTracks,
}