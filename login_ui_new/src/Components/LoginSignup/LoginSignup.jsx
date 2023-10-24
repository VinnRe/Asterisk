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

    const handleLoginSubmit = async (event) => {
        window.event.preventDefault();

        try {
            const response = await fetch('http://localhost:8080/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: loginUsername,
                    password: loginPassword,
                }),
            });

            if (response.ok) {
                // Handle successful login, e.g., redirect user to dashboard
            } else {
                // Handle login failure, show error message
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
