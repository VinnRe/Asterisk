document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.querySelector(".sidebar");

    function toggleSidebar(mouseEvent, width) {
        sidebar.addEventListener(mouseEvent , (event) => {
            event.preventDefault();
            sidebar.style.width = width;
        });
    }

    toggleSidebar("mouseover", "10rem");
    toggleSidebar("mouseout", "4rem");

    const opaqueBackground = document.querySelector(".opaque-background");
    const settingsButton = document.querySelector(".settings-button");
    const settingsOverlay = document.querySelector(".settings-overlay");
    const exitButton = document.querySelector(".exit-button");
    const joinButton = document.querySelector(".join-button");
    const formOverlay = document.querySelector(".form-overlay");
    const backButton = document.querySelector(".back-button");
    
    function toggleOverlay(addEvent, value, visibility, opacity) {
        addEvent.addEventListener("click", (event) => {
            event.preventDefault();
            opaqueBackground.style.visibility = visibility;
            opaqueBackground.style.opacity = opacity;
            value.style.visibility = visibility;
            value.style.opacity = opacity;
        });
    }

    toggleOverlay(settingsButton, settingsOverlay, "visible", "1");
    toggleOverlay(exitButton, settingsOverlay, "hidden", "0");
    toggleOverlay(joinButton, formOverlay, "visible", "1");
    toggleOverlay(backButton, formOverlay, "hidden", "0");
});
