import React, { useEffect } from 'react';

function FormHandling() {
    useEffect(() => {
        const handleFormSwitching = () => {
            const loginForm = document.querySelector("#login");
            const createAccountForm = document.querySelector("#createAccount");

            if (loginForm && createAccountForm) {
                document.querySelector("#linkCreateAccount").addEventListener("click", (e) => {
                    e.preventDefault();
                    loginForm.classList.add("form--hidden");
                    createAccountForm.classList.remove("form--hidden");
                });

                document.querySelector("#linkLogin").addEventListener("click", (e) => {
                    e.preventDefault();
                    loginForm.classList.remove("form--hidden");
                    createAccountForm.classList.add("form--hidden");
                });

                loginForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    // Perform the AJAX/Fetch Login
                    // if success 
                    setFormMessage(loginForm, "success", "Successfully Logged In!");
                    // if error
                    setFormMessage(loginForm, "error", "Invalid Username/Password! Please try again.");
                });

                document.querySelectorAll(".form__input").forEach((inputElement) => {
                    inputElement.addEventListener("blur", (e) => {
                        if (e.target.id === "signupUsername" && e.target.value.length > 0 && e.target.value.length < 4) {
                            setInputError(inputElement, "Username must be at least 4 characters in length");
                        }
                    });

                    inputElement.addEventListener("input", (e) => {
                        clearInputError(inputElement);
                    });
                });
            }
        };

        handleFormSwitching();

        return () => {
            // Cleanup code if needed
            // For example, remove event listeners to prevent memory leaks
            const linkCreateAccount = document.querySelector("#linkCreateAccount");
            const linkLogin = document.querySelector("#linkLogin");
            const loginForm = document.querySelector("#login");
            const createAccountForm = document.querySelector("#createAccount");

            linkCreateAccount.removeEventListener("click", handleCreateAccountClick);
            linkLogin.removeEventListener("click", handleLoginClick);
            loginForm.removeEventListener("submit", handleLoginFormSubmit);
        };
    }, []); // Empty dependency array ensures the effect runs once after the initial render

    const handleCreateAccountClick = (e) => {
        e.preventDefault();
        const loginForm = document.querySelector("#login");
        const createAccountForm = document.querySelector("#createAccount");
        loginForm.classList.add("form--hidden");
        createAccountForm.classList.remove("form--hidden");
    };

    const handleLoginClick = (e) => {
        e.preventDefault();
        const loginForm = document.querySelector("#login");
        const createAccountForm = document.querySelector("#createAccount");
        loginForm.classList.remove("form--hidden");
        createAccountForm.classList.add("form--hidden");
    };

    const handleLoginFormSubmit = (e) => {
        e.preventDefault();
        const loginForm = document.querySelector("#login");
        // Perform the AJAX/Fetch Login
        // if success 
        setFormMessage(loginForm, "success", "Successfully Logged In!");
        // if error
        setFormMessage(loginForm, "error", "Invalid Username/Password! Please try again.");
    };

    const setFormMessage = (formElement, type, message) => {
        const messageElement = formElement.querySelector(".form__message");
        messageElement.textContent = message;
        messageElement.classList.remove("form__message--success", "form__message--error");
        messageElement.classList.add(`form__message--${type}`);
    };

    const setInputError = (inputElement, message) => {
        inputElement.classList.add("form__input--error");
        inputElement.parentElement.querySelector(".form__input-error-message").textContent = message;
    };

    const clearInputError = (inputElement) => {
        inputElement.classList.remove("form__input--error");
        inputElement.parentElement.querySelector(".form__input-error-message").textContent = "";
    };

    return null;
}

export default FormHandling;

