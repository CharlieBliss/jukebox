const readline = require('readline')

exports = module.exports = {}

exports.handleUserInput = handleUserInput = (query) => {
	if(query.match(/(add "[^"]+" "[^"]+"$)|(play "[^"]+"$)|(show all$)|(show unplayed$)|(show unplayed by "[^"]+"$)|(show all by "[^"]+"$)/i)) {
		return true
	}
	console.error(
		`The jukebox didn't recognize your request, please input a valid request
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
exports.albumExists = albumExists = (state, title) => state.some(album => album.title === title)

exports.artistExists = artistExists = (state, artist) => state.some(album => album.artist === artist)

exports.addAlbum = addAlbum = (state, args = []) => {
	const [title, artist] = args
	if(albumExists(state, title)) {
		console.error('An album by that name is already in the jukebox.')
		return null
	}
	return [
		...state,
		{
			artist: artist.trim(),
			title: title.trim(),
			played: false
		}
	]
}

exports.playAlbum = playAlbum = (state, args) => {
	const [title] = args
	if(albumExists) {
		return state.map(album => {
			if (album.title === title) {
				album.played = true
			}
			return album
		})
	}
	console.error("This album isn't in the jukebox.")
	return null
}

exports.ACTIONS = ACTIONS = {
	'add': addAlbum,
	'play': playAlbum,
}

exports.showAll = showAll = (albums) => {
		return albums.map(album =>
			`"${album.title}" by ${album.artist} (${ album.played ? 'played' : 'unplayed' })`
		).join('\n')
}

exports.filterByArtist = filterByArtist = (albums, artist) =>
	albums.filter(album =>
		album.artist === artist
	)

exports.filterByUnplayed = filterByUnplayed = (albums) =>
	albums.filter(album =>
		!album.played
	)

exports.handleArtistInput = handleArtistInput = (state, args, action) => {
	if(artistExists(state, args[0])) {
		return action()
	}
	return 'No albums by that artist'
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
			return rl.close()
		}
		let newState = state
		if(handleUserInput(ans)) {
			let [action, ...args] = ans.split('"').filter(x => x && x !== ' ')
			action = action.trim()
			if(['add', 'play'].includes(action)) {
				newState = dispatchAction(state, ACTIONS[action], args)
			}
			if(newState) {
				console.log(userOutput(newState, action, args))
			} else {
				newState = state
			}
		}
		promptQuestion(rl, newState)
	})
}

exports.initializeApp = initializeApp = () => {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})
	state = []
	promptQuestion(rl, state)
}

exports.dispatchAction = dispatchAction = (prevState = state, action = (state) => state, args) => {
	return action(prevState, args)
}
