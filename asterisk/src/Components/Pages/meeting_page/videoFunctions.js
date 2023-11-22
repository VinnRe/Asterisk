export function resizeVideoElements(videoRef) {
    if (videoRef.current) {
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
    }
}
