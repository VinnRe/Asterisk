export function resizeVideoElements(videoRef, audioRef) {
    if (videoRef.current && audioRef.current) {
        const videoContainerWidth = videoRef.current.offsetWidth;
        const videoContainerHeight = videoRef.current.offsetHeight;
        const aspectRatio = 4 / 3; // You can adjust this based on your desired aspect ratio

        // Calculate the width and height for the video elements
        let videoWidth = videoContainerWidth;
        let videoHeight = videoContainerWidth / aspectRatio;

        // Check if the calculated video height exceeds the container height
        if (videoHeight > videoContainerHeight) {
            videoHeight = videoContainerHeight;
            videoWidth = videoContainerHeight * aspectRatio;
        }

        // Set the width and height for video elements
        videoRef.current.style.width = `${videoWidth}px`;
        videoRef.current.style.height = `${videoHeight}px`;
        audioRef.current.style.width = `${videoWidth}px`;
        audioRef.current.style.height = `${videoHeight}px`;
    }
}

export function createVideoElement(id) {
    // Create and return a new video element with the given id
    const videoElement = document.createElement('video');
    videoElement.setAttribute('id', id);
    videoElement.setAttribute('playsInline', true);
    videoElement.setAttribute('autoPlay', true);
    videoElement.className = "video-element";
    return videoElement;
}