const videoGrid = document.getElementById("video-grid");

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadmetadata", () => {
        video.play();
    });
    videoGrid.appendChild(video);
}

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        const myVideo = document.createElement('video');
        myVideo.muted = true;
        addVideoStream(myVideo, stream);

        const peerConnection = new RTCPeerConnection();

        // Handle incoming stream from other users
        peerConnection.ontrack = function (event) {
            const remoteVideo = document.createElement('video');
            addVideoStream(remoteVideo, event.streams[0]);
        };

        // Add tracks to the peer connection for broadcasting
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        // Get the ICE candidates and send them to the other peer
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                // Send the candidate to the remote peer
            }
        };
    })
    .catch(error => {
        console.error('Error accessing media devices:', error);
    });
