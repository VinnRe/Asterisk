document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.querySelector(".sidebar");
    const opaqueBackground = document.querySelector(".opaque-background");
    const settingsButton = document.querySelector(".settings-button");
    const settingsOverlay = document.querySelector(".settings-overlay");
    const settingsExitButton = document.querySelector(".settings-exit-button");
    const joinButton = document.querySelector(".join-button");
    const formOverlay = document.querySelector(".form-overlay");
    const backButton = document.querySelector(".back-button");
    const accountButton = document.querySelector(".account-button");
    const accountOverlay = document.querySelector(".account-overlay");
    const accountExitButton = document.querySelector(".account-exit-button");
    
    function toggleSidebar(mouseEvent, width) {
        sidebar.addEventListener(mouseEvent , (event) => {
            event.preventDefault();
            sidebar.style.width = width;
        });
    }

    toggleSidebar("mouseover", "10rem");
    toggleSidebar("mouseout", "4rem");
    
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
    toggleOverlay(settingsExitButton, settingsOverlay, "hidden", "0");
    toggleOverlay(joinButton, formOverlay, "visible", "1");
    toggleOverlay(backButton, formOverlay, "hidden", "0");
    toggleOverlay(accountButton, accountOverlay, "visible", "1");
    toggleOverlay(accountExitButton, accountOverlay, "hidden", "0");
});