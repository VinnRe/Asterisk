// Sets the message in a specified form
function setFormMessage(formElement, type, message) {
    const messageElement = formElement.querySelector(".form__message");

    messageElement.textContent = message;
    messageElement.classList.remove("form__message--success", "form__message--error");
    messageElement.classList.add('.form__message--${type}');
}

// Sets error messages for a specific input element
function setInputError(inputElement, message) {
    inputElement.classList.add("form__input--error");
    inputElement.parentElement.querySelector(".form__input-error-message").textContent = message;
}

// Clears the error state of the login/signup form
function clearInputError(inputElement) {
    inputElement.classList.remove("form__input--error");
    inputElement.parentElement.querySelector(".form__input-error-message").textContent = "";
}

// For when the the page contents are loaded
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login");
    const createAccountForm = document.querySelector("#createAccount");

    // When user clicks the Create account text
    document.querySelector("#linkCreateAccount").addEventListener("click", e => {
        e.preventDefault();
        loginForm.classList.add("form--hidden");
        createAccountForm.classList.remove("form--hidden");
    });
    
    // When user clicks the "Already have an account" text
    document.querySelector("#linkLogin").addEventListener("click", e => {
        e.preventDefault();
        loginForm.classList.remove("form--hidden");
        createAccountForm.classList.add("form--hidden");
    });

    // Handles the Login Sequence
    loginForm.addEventListener("submit", e => {
        e.preventDefault();

        // Permorm the AJAX/Fetch Login

        // if success 
        setFormMessage(loginForm, "success", "Successfully Logged In!");

        // if error
        setFormMessage(loginForm, "error", "Invalid Username/Password! Please try again.");
    });

    // Handles the minimum character length for Signup/Create Acc form
    document.querySelectorAll(".form__input").forEach(inputElement => {
        inputElement.addEventListener("blur", e => {
           if (e.target.id === "signupUsername" && e.target.value.length > 0 && e.target.value.length < 4) {
                setInputError(inputElement, "Username must be at least 4 characters in legnth")
           } 
        });

        inputElement.addEventListener("input", e => {
            clearInputError(inputElement);
        });
    });
});