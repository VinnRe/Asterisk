import React, { useState } from 'react';
import './LSstyles.css';

export const LoginSignup = () => {
    const [isLoginForm, setIsLoginForm] = useState(true);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupUsername, setSignupUsername] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleToggleForm = () => {
        setIsLoginForm(!isLoginForm);

        const signupForm = document.getElementById('createAccount');
        if (signupForm) {
            signupForm.classList.remove('form--hidden');
        }
    };

    const handleLoginSubmit = (event) => {
        window.event.preventDefault();
        // Handle login form submission logic here using loginUsername and loginPassword
    };

    const handleSignupSubmit = (event) => {
        window.event.preventDefault();
        // Handle signup form submission logic here using signupUsername, signupEmail, signupPassword, and confirmPassword
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
                            onChange={(e) => setLoginUsername(e.target.value)}
                        />
                        <div className="form__input-error-message"></div>
                    </div>
                    <div className="form__input-group">
                        <input
                            type="password"
                            className="form__input"
                            placeholder="Password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                        />
                        <div className="form__input-error-message"></div>
                    </div>
                    <button className="form__button" type="submit">Login</button>
                    <p className="form__text">
                        <a href="#" className="form__link">Forgot your password?</a>
                    </p>
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
                            onChange={(e) => setSignupUsername(e.target.value)}
                        />
                        <div className="form__input-error-message"></div>
                    </div>
                    <div className="form__input-group">
                        <input
                            type="text"
                            className="form__input"
                            autoFocus
                            placeholder="Email"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                        />
                        <div className="form__input-error-message"></div>
                    </div>
                    <div className="form__input-group">
                        <input
                            type="password"
                            className="form__input"
                            autoFocus
                            placeholder="Password"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                        />
                        <div className="form__input-error-message"></div>
                    </div>
                    <div className="form__input-group">
                        <input
                            type="password"
                            className="form__input"
                            autoFocus
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <div className="form__input-error-message"></div>
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
