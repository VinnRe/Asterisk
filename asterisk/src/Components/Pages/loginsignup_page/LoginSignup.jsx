import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../../Styles/login-signup_styles.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import validator from 'validator';

export const LoginSignup = () => {
    // Switching
    const [isLoginForm, setIsLoginForm] = useState(true);
    const navigate = useNavigate();
    // Data Var
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    // const [signupUsername, setSignupUsername] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [signupFN, setSignupFN] = useState('');
    const [signupMN, setSignupMN] = useState('');
    const [signupLN, setSignupLN] = useState('');
    const [signupNE, setSignupNE] = useState('');
    const [signupBirthdate, setSignupBirthdate] = useState('');
    const [signupGender, setSignupGender] = useState('');
    // ERROR MESSAGES
    // const [usernameSErrorMessage, setUsernameSErrorMessage] = useState('');
    const [emailSErrorMessage, setEmailSErrorMessage] = useState('');
    const [passwordSErrorMessage, setPasswordSErrorMessage] = useState('');
    const [confPassSErrorMessage, setConfPassSErrorMessage] = useState('');
    const [loginErrorMessage, setLoginErrorMessage] = useState('');
    const [firstNSErrorMessage, setFirstNSErrorMessage] = useState('');
    const [midNSErrorMessage, setMidNSErrorMessage] = useState('');
    const [lastNSErrorMessage, setLastNSErrorMessage] = useState('');
    const [nameESErrorMessage, setNameESErrorMessage] = useState('');
    const [BDATESErrorMessage, setBDATESErrorMessage] = useState('');
    const [genderSErrorMessage, setGenderSErrorMessage] = useState('');


    const handleToggleForm = () => {
        setIsLoginForm(!isLoginForm);

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
            const isEmail = validator.isEmail(loginEmail);

            const requestBody = isEmail({email: loginEmail, password: loginPassword})
                             
            const response = await fetch('http://localhost:8080/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const data = await response.json();
                const { accessToken } = data;

                // Store JWT Token in cookies
                Cookies.set('accessToken', accessToken);

                // Redirect to home page
                navigate('/home');

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
                    first_name: signupFN,
                    middle_name: signupMN,
                    last_name:signupLN,
                    name_ext:signupNE,
                    birthdate: signupBirthdate,
                    gender: signupGender,
                    email: signupEmail,
                    password: signupPassword,

                }),
            });

            // Validation of sign up form
            const MIN_PASSWORD_LENGTH = 8;
            const validationErrors = {};

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
        <body className='body--ls'>
            <div className="container--ls">
                {isLoginForm ? (
                    <form className="form--ls" id="login" onSubmit={handleLoginSubmit}>
                        <h1 className="form__title">Login</h1>
                        <div className="form__message form__message--error"></div>
                        <div className="form__input-group">
                            <input
                                type="text"
                                className="form__input"
                                autoFocus
                                placeholder="Email"
                                value={loginEmail}
                                onChange={(e) => {
                                    setLoginEmail(e.target.value);
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
                    <form className={"form--ls ${isLoginForm ? '' : 'form--hidden'}"} id="createAccount" onSubmit={handleSignupSubmit}>
                        <h1 className="form__title">Create Account</h1>
                        <div className="form__message form__message--error"></div>
                        <div className="form__input-group">
                            <input
                                type="text"
                                id="signupFN"
                                className="form__input"
                                autoFocus
                                placeholder="First Name"
                                value={signupFN}
                                onChange={(e) => {
                                    setSignupFN(e.target.value);
                                    setFirstNSErrorMessage('');
                                }}
                            />
                            <div className="form__input-error-message">{firstNSErrorMessage}</div>
                        </div>
                        <div className="form__input-group">
                            <input 
                                type="text"
                                className="form__input"
                                autoFocus
                                placeholder='Middle Name'
                                value={signupMN}
                                onChange={(e) => {
                                    setSignupMN(e.target.value);
                                    setMidNSErrorMessage('');
                                }} 
                            />
                            <div className="form__input-error-message">{midNSErrorMessage}</div>
                        </div>
                        <div className="form__input-group">
                            <input 
                                type="text"
                                className="form__input"
                                autoFocus
                                placeholder='Last Name'
                                value={signupLN}
                                onChange={(e) => {
                                    setSignupLN(e.target.value);
                                    setLastNSErrorMessage('');
                                }} 
                            />
                            <div className="form__input-error-message">{lastNSErrorMessage}</div>
                        </div>
                        <div className="form__input-group">
                            <input 
                                type="text"
                                className="form__input"
                                autoFocus
                                placeholder='Name Extension'
                                value={signupNE}
                                onChange={(e) => {
                                    setSignupNE(e.target.value);
                                    setNameESErrorMessage('');
                                }} 
                                required={false}
                            />
                            <div className="form__input-error-message">{nameESErrorMessage}</div>
                        </div>
                        <div className="form__input-group--double">
                            <DatePicker 
                                selected={signupBirthdate}
                                onChange={(date) => {setSignupBirthdate(date); setBDATESErrorMessage();}}
                                placeholderText="Birth Date"
                                dateFormat="dd/MM/yyyy"
                                className="form__input"
                                isClearable
                                showYearDropdown
                                yearDropdownItemNumber={70}
                                scrollableYearDropdown
                                yearDropDownMin={1950}
                                yearDropDownMax={new Date().getFullYear()}
                            />
                            <select 
                                className="form__input gender-dropdown"
                                value={signupGender}
                                onChange={(e) => {setSignupGender(e.target.value); setGenderSErrorMessage('');}}
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                            <div className="form__input-error-message">{genderSErrorMessage}</div>
                            <div className="form__input-error-message">{BDATESErrorMessage}</div>
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
        </body>
    );
};
