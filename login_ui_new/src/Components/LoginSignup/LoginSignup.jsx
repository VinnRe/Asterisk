import React, { useState } from 'react';
import './LSstyles.css';
import validator from 'validator';

export const LoginSignup = () => {
    const [isLoginForm, setIsLoginForm] = useState(true);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupUsername, setSignupUsername] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [usernameSErrorMessage, setUsernameSErrorMessage] = useState('');
    const [emailSErrorMessage, setEmailSErrorMessage] = useState('');
    const [passwordSErrorMessage, setPasswordSErrorMessage] = useState('');
    const [confPassSErrorMessage, setConfPassSErrorMessage] = useState('');
    const [loginErrorMessage, setLoginErrorMessage] = useState('');


    const handleToggleForm = () => {
        setIsLoginForm(!isLoginForm);

        setUsernameSErrorMessage('');
        setEmailSErrorMessage('');
        setPasswordSErrorMessage('');
        setConfPassSErrorMessage('');
        setLoginErrorMessage('');

        const signupForm = document.getElementById('createAccount');
        if (signupForm) {
            signupForm.classList.remove('form--hidden');
        }
    };

    const handleLoginSubmit = async (event) => {
        window.event.preventDefault();
        try {
            const isEmail = validator.isEmail(loginUsername);

            const requestBody = isEmail
                ? {email: loginUsername, password: loginPassword}
                : {username: loginUsername, password: loginErrorMessage};
                
            const response = await fetch('http://localhost:8080/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                // Handle successful login, e.g., redirect user to dashboard
                console.log("SUCCESS");
            } else {
                // Handle login failure, show error message
                const validationErrors = {};

                validationErrors.loginErrorMessage = 'Incorrect Login Credentials.';

                setLoginErrorMessage(validationErrors.loginErrorMessage || '');

                if (Object.keys(validationErrors).length > 0) {
                    // There are validation errors, return without making the API call
                    return;
                }
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    const handleSignupSubmit = async (event) => {
        window.event.preventDefault();

        try {
            const response = await fetch('http://localhost:8080/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: signupUsername,
                    email: signupEmail,
                    password: signupPassword,

                }),
            });

            // Validation of sign up form
            const MIN_PASSWORD_LENGTH = 8;
            const MIN_USERNAME_LENGTH = 4;
            const validationErrors = {};

            if (signupUsername.length < MIN_USERNAME_LENGTH) {
                validationErrors.usernameSErrorMessage = 'Username must be at least 4 characters long.';
            }

            if (signupPassword.length < MIN_PASSWORD_LENGTH) {
                validationErrors.passwordSErrorMessage = 'Password must be at least 8 characters long.';
            }

            if (signupPassword !== confirmPassword) {
                validationErrors.passwordSErrorMessage = 'Passwords do not match.';
                validationErrors.confPassSErrorMessage = 'Passwords do not match.';
            }

            if (!validator.isEmail(signupEmail)) {
                validationErrors.emailSErrorMessage = 'Email is not valid.';
            }

            setUsernameSErrorMessage(validationErrors.usernameSErrorMessage || '');
            setPasswordSErrorMessage(validationErrors.passwordSErrorMessage || '');
            setConfPassSErrorMessage(validationErrors.confPassSErrorMessage || '');
            setEmailSErrorMessage(validationErrors.emailSErrorMessage || '');

            if (Object.keys(validationErrors).length > 0) {
                // There are validation errors, return without making the API call
                return;
            }

            if (response.ok) {
                // Handle successful signup, e.g., show success message
            } else {
                // Handle signup failure, show error message
            }
        } catch (error) {
            console.error('Error during signup:', error);
        }
    };
    
    return (
        <div className="container">
            {isLoginForm ? (
                <form className="form" id="login" onSubmit={handleLoginSubmit}>
                    <h1 className="form__title">Login</h1>
                    <div className="form__message form__message--error"></div>
                    <div className="form__input-group">
                        <input
                            type="text"
                            className="form__input"
                            autoFocus
                            placeholder="Username or Email"
                            value={loginUsername}
                            onChange={(e) => {
                                setLoginUsername(e.target.value);
                                setLoginErrorMessage('');
                            }}
                        />
                        <div className="form__input-error-message"></div>
                    </div>
                    <div className="form__input-group">
                        <input
                            type="password"
                            className="form__input"
                            placeholder="Password"
                            value={loginPassword}
                            onChange={(e) => {
                                setLoginPassword(e.target.value);
                                setLoginErrorMessage('');
                            }}
                        />
                        <div className="form__input-error-message"></div>
                    </div>
                    <button className="form__button" type="submit">Login</button>
                    <div className="form__input-error-message">{loginErrorMessage}</div>
                    <p className="form__text">
                        <a className="form__link" href="#" onClick={handleToggleForm}>Don't have an account? Create account.</a>
                    </p>
                </form>
            ) : (
                <form className={"form ${isLoginForm ? '' : 'form--hidden'}"} id="createAccount" onSubmit={handleSignupSubmit}>
                    <h1 className="form__title">Create Account</h1>
                    <div className="form__message form__message--error"></div>
                    <div className="form__input-group">
                        <input
                            type="text"
                            id="signupUsername"
                            className="form__input"
                            autoFocus
                            placeholder="Username"
                            value={signupUsername}
                            onChange={(e) => {
                                setSignupUsername(e.target.value);
                                setUsernameSErrorMessage('');
                            }}
                        />
                        <div className="form__input-error-message">{usernameSErrorMessage}</div>
                    </div>
                    <div className="form__input-group">
                        <input
                            type="text"
                            className="form__input"
                            autoFocus
                            placeholder="Email"
                            value={signupEmail}
                            onChange={(e) => {
                                setSignupEmail(e.target.value);
                                setEmailSErrorMessage('');
                            }}
                        />
                        <div className="form__input-error-message">{emailSErrorMessage}</div>
                    </div>
                    <div className="form__input-group">
                        <input
                            type="password"
                            className="form__input"
                            autoFocus
                            placeholder="Password"
                            value={signupPassword}
                            onChange={(e) => {
                                setSignupPassword(e.target.value);
                                setPasswordSErrorMessage('');
                                setConfPassSErrorMessage('');
                            }}
                        />
                        <div className="form__input-error-message">{passwordSErrorMessage}</div>
                    </div>
                    <div className="form__input-group">
                        <input
                            type="password"
                            className="form__input"
                            autoFocus
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value)
                                setPasswordSErrorMessage('');
                                setConfPassSErrorMessage('');
                            }}
                        />
                        <div className="form__input-error-message">{confPassSErrorMessage}</div>
                    </div>
                    <button className="form__button" type="submit">Create Account</button>
                    <p className="form__text">
                        <a className="form__link" href="#" onClick={handleToggleForm}>Already have an account? Sign in.</a>
                    </p>
                </form>
            )}
        </div>
    );
};
