export function resizeVideoElements(videoRef, aspectRatio = 4 / 3, desiredWidth = null, desiredHeight = null) {
    if (videoRef.current) {
        const videoContainerWidth = videoRef.current.offsetWidth;
        const videoContainerHeight = videoRef.current.offsetHeight;

        // Use the specified dimensions or default to the container dimensions
        const containerWidth = desiredWidth || videoContainerWidth;
        const containerHeight = desiredHeight || videoContainerHeight;

        // Calculate the width and height for the video elements
        let videoWidth = containerWidth;
        let videoHeight = containerWidth / aspectRatio;

        // Check if the calculated video height exceeds the container height
        if (videoHeight > containerHeight) {
            videoHeight = containerHeight;
            videoWidth = containerHeight * aspectRatio;
        }

        // Set the width and height for video elements
        videoRef.current.style.width = `${videoWidth}px`;
        videoRef.current.style.height = `${videoHeight}px`;
    }
}
