import React, { useState } from 'react'
import './LoginSignup.css'

/*
import user_icon from '../Assets/person.png'
import email_icon from '../Assets/email.png'
import password_icon from '../Assets/password.png'
*/

export const LoginSignup = () => {
  
    const [action, setAction] = useState("Sign Up");

  
    return (
    <div className='container'>
        <div className="header">
            <div className="text">{action}</div>
            <div className="underline"></div>
        </div>
        <div className="inputs">
            {action === "Login" ? <div></div> :
                <div className="input">
                <img src="{user_icon}" alt="" />
                <input type="text" placeholder='Username' />
            </div>
            }
            <div className="input">
                <img src="{email_icon}" alt="" />
                <input type="email" placeholder='Email' />
            </div>
            <div className="input">
                <img src="{password_icon}" alt="" />
                <input type="password" placeholder='Password' />
            </div>

            <div className="input">
                <img src="{password_icon}" alt="" />
                <input type="password" placeholder='Confirm Password' />
            </div>

            {action === "Sign Up" ? <div></div> : 
                <div className="forgot-password">Forgot Password? <span>Click Here!</span></div>
            }
            <div className="submit-container">
                <div className={action==="Login" ? "submit gray" : "submit"} onClick={() => {setAction("Sign Up")}}>Sign Up</div>
                <div className={action === "Sign Up" ? "submit gray" : "submit"} onClick={() => {setAction("Login")}}>Login</div>
            </div>
        </div>
    </div>
  )
}


import React, { useState } from 'react'
import './LSstyles.css'
// import FormHandling from './switchLS';

/*
import user_icon from '../Assets/person.png'
import email_icon from '../Assets/email.png'
import password_icon from '../Assets/password.png'
*/

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
    };

    const handleLoginSubmit = (event) => {
        window.event.preventDefault();
        // Handle login form submission logic here
    };

    const handleSignupSubmit = (event) => {
        window.event.preventDefault();
        // Handle signup form submission logic here
    };
    
    return (
        <div className="container">
            {/* Conditional rendering based on isLoginForm state */}
            {isLoginForm ? (
                // Login Page
                <form className="form" id="login">
                    {/* Main Login Form */}
                    <h1 className="form__title">Login</h1>
                    <div className="form__message form__message--error"></div>
                    {/* Username or Email Text Field */}
                    <div className="form__input-group">
                        <input type="text" className="form__input" autoFocus placeholder="Username or Email" />
                        <div className="form__input-error-message"></div>
                    </div>
                    {/* Password Field (Autohide) */}
                    <div className="form__input-group">
                        <input type="password" className="form__input" autoFocus placeholder="Password" />
                        <div className="form__input-error-message"></div>
                    </div>
                    {/* Buttons for login form */}
                    <button className="form__button" type="submit">Login</button>
                    {/* Other links for the forms */}
                    <p className="form__text">
                        <a href="#" className="form__link">Forgot your password?</a>
                    </p>
                    <p className="form__text">
                        <a className="form__link" href="#" onClick={handleToggleForm}>Don't have an account? Create account.</a>
                    </p>
                </form>
            ) : (
                // Signup / Create Account Page
                <form className="form form--hidden" id="createAccount">
                    {/* Main Signup Form */}
                    <h1 className="form__title">Create Account</h1>
                    <div className="form__message form__message--error"></div>
                    {/* Input Username Field */}
                    <div className="form__input-group">
                        <input type="text" id="signupUsername" className="form__input" autoFocus placeholder="Username" />
                        <div className="form__input-error-message"></div>
                    </div>
                    {/* Input Email Field */}
                    <div className="form__input-group">
                        <input type="text" className="form__input" autoFocus placeholder="Email" />
                        <div className="form__input-error-message"></div>
                    </div>
                    {/* Input Password Field */}
                    <div className="form__input-group">
                        <input type="password" className="form__input" autoFocus placeholder="Password" />
                        <div className="form__input-error-message"></div>
                    </div>
                    {/* Input Confirm Password Field */}
                    <div className="form__input-group">
                        <input type="password" className="form__input" autoFocus placeholder="Confirm Password" />
                        <div className="form__input-error-message"></div>
                    </div>
                    {/* Buttons for Create Account form */}
                    <button className="form__button" type="submit">Create Account</button>
                    {/* Other links for the forms */}
                    <p className="form__text">
                        <a className="form__link" href="#" onClick={handleToggleForm}>Already have an account? Sign in.</a>
                    </p>
                </form>
            )}
        </div>
  );
};
