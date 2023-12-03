import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../../Styles/home_styles.css';
import Cookies from "js-cookie";
import logo from '../../Assets/asterisk-logo.png'


export const HomePage = ({ userName, audioVolume, setAudioVolume, roomNumber, setRoomNumber, camStatus, setCamStatus, micStatus, setMicStatus, tC, tM}) => {
    const navigate = useNavigate();

    const handleToggleCam = () => {
        if (camStatus === true) {
            setCamStatus(false);
            // tC();
        } else {
            setCamStatus(true);
            // tC();
        }
    }

    console.log(camStatus);

    const handleToggleMic = () => {
        if (micStatus === true) {
            setMicStatus(false);
            // tM();
        } else {
            setMicStatus(true);
            // tM();
        }
    }

    console.log(micStatus); 

    const generateRoomNumber = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
        let randomRoomNumber = '';
        
        const roomNumberLength = 10;
        for (let i = 0; i < roomNumberLength; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomRoomNumber += characters.charAt(randomIndex);
        }
    
        const updatedRoomNumber = randomRoomNumber;

        setRoomNumber(() => {
            navigate(`/room/${randomRoomNumber}`);
            storeLink(userName, updatedRoomNumber);
            localStorage.setItem('roomNumber', updatedRoomNumber)
            return randomRoomNumber;
        });

    };

    const storeLink = async (userName, randomRoomNumber) => {
        try {
            const response = await fetch('http://localhost:8080/api/auth/meeting_links', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userName : userName,
                    meetingLink : randomRoomNumber
                }),
            });
    } catch (error) {
        console.error('Error during signup:', error);
    }}

    const checkLink = async (randomRoomNumber) => {
        try {
            const response = await fetch(`http://localhost:8080/api/auth/meeting_links/${randomRoomNumber}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                console.error('Error:', response.status, response.statusText);
                throw new Error('Failed to retrieve meeting link');
            }
    
            const data = await response.json();

            if (data.exists) {
                navigate(`/room/${roomNumber}`)
            } else {
                console.log('Meeting link does not exist:', data);
            }
        } catch (error) {
            console.error('Error during GET request:', error);
        }
    }
    
    
    const joinConferenceClick = (e) => {
        e.preventDefault();
        checkLink(roomNumber);
     }
     

      const handleJoinClick = () => {
        generateRoomNumber();
    };
    const handleLogout = () => {
        // Clear the authentication token from cookies
        Cookies.remove('accessToken');
    
        // Redirect to the login page or any other desired page
        navigate("/login-signup");
      };

    useEffect(() => {
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

        const storedRoomNumber = localStorage.getItem('roomNumber');
        if (storedRoomNumber) {
            setRoomNumber(storedRoomNumber);
        }

        function toggleSidebar(mouseEvent, isExpanded) {
            sidebar.addEventListener(mouseEvent, (event) => {
                event.preventDefault();
                sidebar.style.width = isExpanded ? "10rem" : "4rem";
            });
        }

        toggleSidebar("mouseover", true);
        toggleSidebar("mouseout", false);

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
    }, []);

    return (

        // REWORK THE BUTTONS TO BE BETTER
        <html className="html--h" lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Asterisk</title>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
                <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet' />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
            </head>

            <body className="body--h">
                <header className="header--h">
                    <h1>Asterisk</h1>
                </header>

                <main className="main--h">
                    <section className="main-section">
                        <div className="controls-container">
                            <a className="join-button" href="">
                                <span className="material-icons conference-buttons">groups</span>
                                <p>Join Conference</p>
                            </a>

                            <a href="" onClick={handleJoinClick}>
                                <span className="material-icons conference-buttons">add</span>
                                <p>Create Conference</p>
                            </a>
                        </div>
                    </section>
                </main>

                <aside className="sidebar">
                    <div className="logo">
                        <img src={logo} alt="asterisk" className="logo-icon"/>
                        <h2>Asterisk</h2>
                    </div>

                    <nav className="nav--h">
                        <ul>
                            <li>
                                <a className="account-button" href="">
                                    <i className="material-icons">account_circle</i>
                                    <span className="icon-text">Account</span>
                                </a>
                            </li>

                            <li>
                                <a className="settings-button" href="">
                                    <i className="material-icons">settings</i>
                                    <span className="icon-text">Settings</span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </aside>

                <section className="opaque-background">
                    <div className="account-overlay">
                        <div className="profile">
                            <div className="profile-icon | material-icons">face</div>
                            <p className="profile-name">{userName}</p>
                        </div>

                        <a href="" onClick={handleLogout}>
                            <span className="material-icons">logout</span>
                            <span>Logout</span>
                        </a>

                        <div className="account-exit-button | exit-button">
                            <span className="material-icons">close</span>
                        </div>
                    </div>

                    <div className="settings-overlay">
                        <h2>Settings</h2>

                        <a>
                            <span className="material-icons">speaker</span>
                            <span>Audio Volume</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={audioVolume}
                                onChange={(e) => setAudioVolume(e.target.value)}
                                className="volume-slider"
                            />
                        </a>
                        <a className="checkbox-toggles">
                            <span className="material-icons">videocam</span>
                            <span className="videoSpan-s">Hide cam when joining a room</span>
                            <label className="checkbox-label">
                                <input type="checkbox" className="checkbox-s" onClick={handleToggleCam} />
                                <span className="checkbox-overlay">
                                    <span className="material-icons">done</span>
                                </span>
                            </label>
                        </a>
                        <a className="checkbox-toggles">
                            <span className="material-icons">mic</span>
                            <span className="micSpan-s">Mute mic when joining a room</span>
                            <label className="checkbox-label">
                                <input type="checkbox" className="checkbox-s" onClick={handleToggleMic}/>
                                <span className="checkbox-overlay">
                                    <span className="material-icons">done</span>
                                </span>
                            </label>
                        </a>
                        <div className="settings-exit-button | exit-button">
                            <span className="material-icons">close</span>
                        </div>
                    </div>

                    <div className="form-overlay">
                        <h2>Enter Meeting Code</h2>
                        <form className="form-buttons" onSubmit={joinConferenceClick}>
                            <input 
                                className="form__input-h" 
                                type="text" 
                                name="join-conference" 
                                value={roomNumber}
                                onChange={(e) => {setRoomNumber(e.target.value)}}
                                autoFocus 
                            />
                            <button type="submit" className="join">
                                Join
                            </button>
                            <a href="" className="back-button">
                                <span>Back</span>
                            </a>
                        </form>
                    </div>
                </section>

                <footer className="footer--h">
                    <div className="developers-container">
                        <h3>Developers</h3>

                        <span>|</span>

                        <a href="https://github.com/mothy-08" target="_blank">
                            <p>Timothy</p>
                        </a>

                        <a href="https://github.com/VinnRe" target="_blank">
                            <p>Kobe</p>
                        </a>

                        <a href="https://github.com/oocim" target="_blank">
                            <p>Mico</p>
                        </a>

                        <a href="https://github.com/herseyy" target="_blank">
                            <p>Hersey</p>
                        </a>
                    </div>

                    <div className="asterisk-container">
                        <img src={logo} alt="asterisk" className="logo-icon | logo-icon__footer"/>                   
                        <h3>Asterisk</h3>
                    </div>

                    <div className="socials-container">
                        <a href="https://github.com/VinnRe/Asterisk.git" target="_blank">
                            <i class="socials-icon | fa fa-github"></i>
                        </a>

                        <span>&copy;All rights reserved.</span>
                    </div>
                </footer>
            </body>
        </html>
    );      
};
