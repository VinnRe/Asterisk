document.addEventListener("DOMContentLoaded", function() {
    const anchor = document.querySelector(".button__anchor");
    const backButton = document.querySelector(".form-button--back");
    const buttonConferenceJoin = document.querySelector(".button--conference-join");
    const buttonConferenceCreate = document.querySelector(".button--conference-create");
    const formHidden = document.querySelector(".form--hidden");

    // Displays Form and Hides Join and Create Button
    anchor.addEventListener("click", function(event) {
        event.preventDefault(); 

        buttonConferenceJoin.style.display = "none";
        buttonConferenceCreate.style.display = "none";

        formHidden.style.display = "block";
    });

    // Displays Join and Create Button and Hides Form
    backButton.addEventListener("click", function(event) {
        event.preventDefault(); 
       
        formHidden.style.display = "none";

        buttonConferenceJoin.style.display = "block";
        buttonConferenceCreate.style.display = "block";
    });
});