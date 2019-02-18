const jukebox = require('./app')
const readline = require('readline')
const test = require('tape')

const MOCK_HAS_SINGLE_ALBUM = [
	{
		title: 'Signals',
		artist: 'Rush',
		plays: 0,
	}
]

const MOCK_HAS_MULTIPLE_ARTISTS = [
	{
		title: 'Signals',
		artist: 'Rush',
		plays: 0,
	},
	{
		title: 'Fire of Unknown Origin',
		artist: 'Blue Öyster Cult',
		plays: 0,
	}
]

const MOCK_HAS_VARIED_PLAY_STATUS_RUSH = [
	{
		title: 'Signals',
		artist: 'Rush',
		plays: 0,
	},
	{
		title: 'Moving Pictures',
		artist: 'Rush',
		plays: 2,
	}
]

const MOCK_HAS_VARIED_PLAY_STATUS = [
	{
		title: 'Signals',
		artist: 'Rush',
		plays: 0,
	},
	{
		title: 'Fire of Unknown Origin',
		artist: 'Blue Öyster Cult',
		plays: 1,
	}
]

const MOCK_HAS_MULTIPLE_PLAY_STATUS = [
	{
		title: 'Signals',
		artist: 'Rush',
		plays: 0,
	},
	{
		title: 'Fire of Unknown Origin',
		artist: 'Blue Öyster Cult',
		plays: 2,
	}
]

const MOCK_HAS_VARIED_DUPLICATE_ARTISTS = [
	{
		title: 'Signals',
		artist: 'Rush',
		plays: 0,
	},
	{
		title: 'Moving Pictures',
		artist: 'Rush',
		plays: 2,
	},
	{
		title: 'Fire of Unknown Origin',
		artist: 'Blue Öyster Cult',
		plays: 0,
	}
]

const MOCK_SHOW_ALL_OUTPUT = '"Signals" by Rush (unplayed)\n"Fire of Unknown Origin" by Blue Öyster Cult (unplayed)'
const MOCK_SINGLE_OUTPUT = '"Signals" by Rush (unplayed)'
const MOCK_SHOW_RUSH_OUTPUT = '"Signals" by Rush (unplayed)\n"Moving Pictures" by Rush (played)'


// I decided to use tape here instead of Jest or Mocha since the project is so simple and functional.
// I thought it would be overkill to install 500+ packages just to run a few unit tests.

console.log('----UNIT TESTS----')

test('User Input Tests', (assert) => {

	assert.ok(jukebox.handleUserInput('add "Signals" "Rush"'))
	assert.notOk(jukebox.handleUserInput('add whatever'))
	assert.ok(jukebox.handleUserInput('play "Signals"'))
	assert.notOk(jukebox.handleUserInput('play Signals'))
	assert.ok(jukebox.handleUserInput('show all'))
	assert.notOk(jukebox.handleUserInput('show all by Big Star'))
	assert.ok(jukebox.handleUserInput('show all by "Big Star"'))
	assert.end();
});

test('Album Exists Tests', (assert) => {
	assert.comment('Should return true if the album is found')
	assert.ok(jukebox.albumExists(MOCK_HAS_SINGLE_ALBUM, 'Signals'))
	assert.comment('Should be case insenstive')
	assert.ok(jukebox.albumExists(MOCK_HAS_SINGLE_ALBUM, 'signals'))
	assert.comment('Should return false if the album is not found')
	assert.notOk(jukebox.albumExists(MOCK_HAS_SINGLE_ALBUM, 'Moving Pictures'))
	assert.end();
});

test('Artist Exists Tests', (assert) => {
	assert.comment('Should return true if the artist is found')
	assert.ok(jukebox.artistExists(MOCK_HAS_SINGLE_ALBUM, 'Rush'))
	assert.comment('Should be case insenstive')
	assert.ok(jukebox.artistExists(MOCK_HAS_SINGLE_ALBUM, 'rush'))
	assert.comment('Should return false if the artist is not found')
	assert.notOk(jukebox.artistExists(MOCK_HAS_SINGLE_ALBUM, 'Big Star'))
	assert.end();
});

test('Add Album Test.', (assert) => {
	assert.comment('Should return a new state with the added album')
	assert.deepEqual(
		jukebox.addAlbum(
			MOCK_HAS_SINGLE_ALBUM,
			['Fire of Unknown Origin', 'Blue Öyster Cult']
		),
		MOCK_HAS_MULTIPLE_ARTISTS
	)
	assert.comment('Should return the same state if the action fails')
	assert.deepEqual(
		jukebox.addAlbum(
			MOCK_HAS_SINGLE_ALBUM,
			['Signals', 'Rush']
		),
		MOCK_HAS_SINGLE_ALBUM
	)
	assert.end()
})

test('Play Album Test.', (assert) => {
	assert.comment('Should return a new state with the played album')
	assert.deepEqual(
		jukebox.playAlbum(
			MOCK_HAS_MULTIPLE_ARTISTS,
			['Fire of Unknown Origin']
		),
		MOCK_HAS_VARIED_PLAY_STATUS
	)
	assert.comment('Should return a new state even if the action has already been perfromed')
	assert.deepEqual(
		jukebox.playAlbum(
			MOCK_HAS_VARIED_PLAY_STATUS,
			['Fire of Unknown Origin']
		),
		MOCK_HAS_MULTIPLE_PLAY_STATUS
	)
	assert.comment('Should return the same state if the action fails')
	assert.deepEqual(
		jukebox.playAlbum(
			MOCK_HAS_SINGLE_ALBUM,
			['Gold', 'Rush']
		),
		MOCK_HAS_SINGLE_ALBUM
	)
	assert.end()
})

test('Output Tests', (assert) => {
	assert.comment('Should properly show all albums')
	assert.equal(
		jukebox.showAll(
			MOCK_HAS_MULTIPLE_ARTISTS,
		),
		MOCK_SHOW_ALL_OUTPUT
	)
	assert.equal(
		jukebox.userOutput(
			MOCK_HAS_MULTIPLE_ARTISTS,
			'show all'
		),
		MOCK_SHOW_ALL_OUTPUT
	)
	assert.comment('Should show correct albums when filtered by unplayed')
	assert.deepEqual(
		jukebox.filterByUnplayed(
			 MOCK_HAS_VARIED_DUPLICATE_ARTISTS,
		),
		MOCK_HAS_MULTIPLE_ARTISTS,
	)
	assert.equal(
		jukebox.userOutput(
			MOCK_HAS_VARIED_DUPLICATE_ARTISTS,
			'show unplayed'
		),
		MOCK_SHOW_ALL_OUTPUT,
	)
	assert.comment('Should show correct albums when filtered by artist')
	assert.deepEqual(
		jukebox.filterByArtist(
			 MOCK_HAS_VARIED_DUPLICATE_ARTISTS,
			 'Rush',
		),
		MOCK_HAS_VARIED_PLAY_STATUS_RUSH,
	)
	assert.equal(
		jukebox.userOutput(
			MOCK_HAS_VARIED_DUPLICATE_ARTISTS,
			'show all by',
			['Rush'],
		),
		MOCK_SHOW_RUSH_OUTPUT,
	)
	assert.comment('Should be case insenstive')
	assert.equal(
		jukebox.userOutput(
			MOCK_HAS_VARIED_DUPLICATE_ARTISTS,
			'show all by',
			['ruSh'],
		),
		MOCK_SHOW_RUSH_OUTPUT,
	)
	assert.comment('Should fail if the artist is not found')
	assert.equal(
		jukebox.userOutput(
			MOCK_HAS_VARIED_DUPLICATE_ARTISTS,
			'show all by',
			['Jethro Tull'],
		),
		'No albums by that artist in the jukebox.',
	)
	assert.comment('Should handle unplayed by')
	assert.equal(
		jukebox.userOutput(
			MOCK_HAS_VARIED_DUPLICATE_ARTISTS,
			'show unplayed by',
			['Rush'],
		),
		MOCK_SINGLE_OUTPUT,
	)
	assert.comment('Should be case insenstive')
	assert.equal(
		jukebox.userOutput(
			MOCK_HAS_VARIED_DUPLICATE_ARTISTS,
			'show unplayed by',
			['rush'],
		),
		MOCK_SINGLE_OUTPUT,
	)
	assert.comment('Should fail if the artist is not found')
	assert.equal(
		jukebox.userOutput(
			MOCK_HAS_VARIED_DUPLICATE_ARTISTS,
			'show unplayed by',
			['Jethro Tull'],
		),
		'No albums by that artist in the jukebox.',
	)
	assert.end()
})
