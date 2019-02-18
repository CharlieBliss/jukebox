const readline = require('readline')
const isEqual = require('lodash.isEqual')

exports = module.exports

// I decided to take a fairly functional approach here since most of the application is based on input/output.
// This also has the advantage of making the application very easy to test and (in my opinion) reason about.

exports.handleUserInput = handleUserInput = (query) => {
	if(query.match(/(add "[^"]+" "[^"]+"$)|(play "[^"]+"$)|(show all$)|(show unplayed$)|(show unplayed by "[^"]+"$)|(show all by "[^"]+"$)/i)) {
		return true
	}
	console.error(
		`
	The jukebox didn't recognize your request, please input a valid request
		- add "title" "artist": adds an album to the collection with the given title and artist. All albums are unplayed by default.
		- play "title": marks a given album as played.
		- show all: displays all of the albums in the collection
		- show unplayed: display all of the albums that are unplayed
		- show all by "artist": shows all of the albums in the collection by the given artist
		- show unplayed by "artist": shows the unplayed albums in the collection by the given artist
		- quit: quits the program
		`
	)
}
exports.albumExists = albumExists = (state, title) => state.some(album => album.title.toLowerCase() === title.toLowerCase())

exports.artistExists = artistExists = (state, artist) => state.some(album => album.artist.toLowerCase() === artist.toLowerCase())

exports.addAlbum = addAlbum = (state, args = [], prompt) => {
	const [title, artist] = args
	if(albumExists(state, title)) {
		console.error('An album by that name is already in the jukebox.')
		return state
	}
	return [
		...state,
		{
			artist: artist.trim(),
			title: title.trim(),
			plays: 0,
		}
	]
}

exports.playAlbum = playAlbum = (state, args, prompt) => {
	const [title] = args
	if(albumExists(state, title)) {
		return state.map(album => {
			if (album.title.toLowerCase() === title.toLowerCase()) {
				return {
					...album,
					plays: (album.plays + 1)
				}
			}
			return album
		})
	}
	console.log("That album isn't in the jukebox.")
	return state
}

exports.ACTIONS = ACTIONS = {
	'add': addAlbum,
	'play': playAlbum,
}

exports.showAll = showAll = (albums) =>
	albums.map(album =>
		`"${album.title}" by ${album.artist} (${ album.plays ? 'played' : 'unplayed' })`
	).join('\n')

exports.filterByArtist = filterByArtist = (albums, artist) =>
	albums.filter((album) =>
		album.artist.toLowerCase() === artist.toLowerCase()
	)

exports.filterByUnplayed = filterByUnplayed = (albums) =>
	albums.filter(({ plays }) =>
		!plays
	)

exports.handleArtistInput = handleArtistInput = (state, args, action) => {
	if(artistExists(state, args[0])) {
		return action()
	}
	return 'No albums by that artist in the jukebox.'
}

exports.userOutput = userOutput = (state, action, args) => {
	switch (action) {
		case 'add':
			return `Added "${args[0]}" by ${args[1]}`
		case 'play':
			return `You're listening to "${args[0]}"`
		case 'show all':
			return showAll(state)
		case 'show all by':
			return handleArtistInput(state, args, () => showAll(filterByArtist(state, args[0])))
		case 'show unplayed':
			return showAll(filterByUnplayed(state))
		case 'show unplayed by':
			return handleArtistInput(state, args, () => showAll(filterByUnplayed(filterByArtist(state, args[0]))))
	}
}

exports.promptQuestion = promptQuestion = (rl, state) => {
	rl.question('', ans => {
		if(ans === 'quit') {
			console.log('Goodbye!')
			return rl.close()
		}
		let newState = [...state]
		let skipOutput = false
		if(handleUserInput(ans)) {
			let [action, ...args] = ans.split('"').filter(x => x && x !== ' ')
			action = action.trim()
			if(['add', 'play'].includes(action)) {
				newState = ACTIONS[action](state, args)
				skipOutput = isEqual(state, newState)
			}
			if(!skipOutput) {
				console.log(userOutput(newState, action, args))
			}

		}
		return promptQuestion(rl, newState)
	})
}

exports.initializeApp = initializeApp = () => {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})
	state = []
	console.log('Welcome to your music collection!')
	promptQuestion(rl, state)
}