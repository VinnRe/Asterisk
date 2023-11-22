import os from 'os';

const config = {
	// http: {
	// 	listenIp: '0.0.0.0',
	// 	listenPort: 8080
	// },

	mediasoup: {
		numOfWorkers: Object.keys(os.cpus()).length,
		worker: {
			logLevel: 'debug',
			logTags: [
				'info',
				'ice',
				'dtls',
				'rtp',
				'srtp',
				'rtcp',
			],
			rtcMinPort: 10000,
			rtcMaxPort: 10100,
		},
		router: {
			// rtp codec capability
			mediaCodecs: [
				{
					kind: 'audio',
					mimeType: 'audio/opus',
					clockRate: 48000,
					channels: 2
				},
				{
					// kind: 'video',
					// mimeType: 'video/H264',
					// clockRate: 90000,
					// parameters: {
					// 	"packetization-mode" : 1,
				 //    	"profile-level-id" : "42e01f",
				 //  	  	"level-asymmetry-allowed" : 1
					// }
					kind: 'video',
				    mimeType: 'video/VP8',
				    clockRate: 90000,
				    parameters: {
				      'x-google-start-bitrate': 1000,
				    },
				},
			]
		},

		// webrtctransport settings
		webRtcTransport: {
			listenInfos: [

				{
					protocol: "udp", 
					ip: '0.0.0.0',
<<<<<<< HEAD
					announcedIp: '192.168.0.113' // replace by public IP address
=======
					announcedIp: '192.168.68.169' // replace by public IP address
>>>>>>> 2bdafe76994c3a96bba111a757b77ff72648268a
				}
			],
			enableUdp: true,
			enableTcp: true,
			preferUdp: true
		},
	}
}

export {
	config
}