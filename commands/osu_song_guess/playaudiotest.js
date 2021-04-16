const path = require('path');
const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');

module.exports = {
	name: 'audiotest',
	description: 'test',
	async execute(message, args) {
		const { voice } = message.member;
        if(!voice.channelID) return message.reply('you must be in a voice channel.');

		let song = {};
		const video_finder = async (query) => {
			const video_result = await ytSearch(query);
			return (video_result.videos.length > 1) ? video_result.videos[0] : null;
		};

		const video = await video_finder(args.join(' '));
		if (video) {
			song = { title: video.title, url: video.url };
		} else {
			message.channel.send('Error finding video.');
		}

		const connection = await voice.channel.join();
		const stream = ytdl(song.url, { filter: 'audioonly' });
		// const dispatcher = connection.play(stream, { seek: 0, volume: 0.5 })
		// .on('finish', () => {
		// 	console.log('finished playing');
		// });

		const audio = path.join(__dirname, 'songtest.mp3');
		const dispatcher = connection.play(audio, { seek: 0, volume: 0.5 })
		.on('finish', () => {
			console.log('finished playing');
		});

	}
};