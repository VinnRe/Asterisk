import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import '../../Styles/home_styles.css';

export const HomePage = () => {
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

    function toggleSidebar(mouseEvent, isExpanded) {
        sidebar.addEventListener(mouseEvent, (event) => {
            event.preventDefault();
            sidebar.style.width = isExpanded ? "10rem" : "2.8rem";
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
      <html lang="en">
          <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Asterisk</title>
              <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
              <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet' />
          </head>
          <body className="body--h">
              <header className="header--h">
                  <h1>Asterisk</h1>
              </header>

              <main className="main--h">
                  <section className="main-section">
                      <div className="controls-container">
                          <a className="join-button" href="">
                              <span className="material-icons">groups</span>
                              <p>Join Conference</p>
                          </a>

                          <a href="">
                            <Link to="/create">
                              <span className="material-icons">add</span>
                              <p>Create Conference</p>
                            </Link>
                          </a>
                      </div>
                  </section>

                  <section className="main-section">
                      <div className="feature-container">
                          <div className="feature-button">Feature 1</div>
                          <div className="feature-button">Feature 2</div>
                          <div className="feature-button">Feature 3</div>
                      </div>
                  </section>
              </main>

              <aside className="sidebar">
                  <div className="logo">
                      <span className="material-icons | logo-icon">emergency</span>
                      <h2>Asterisk</h2>
                  </div>

                  <nav className="nav--h">
                      <ul>
                          <li>
                              <a className="dashboard-button" href="">
                                  <i className="material-icons">space_dashboard</i>
                                  <span className="icon-text">Dashboard</span>
                              </a>
                          </li>

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
                  <div className="dashboard-overlay">
                      <h2>Dashboard</h2>
                  </div>

                  <div className="account-overlay">
                      <div className="profile">
                          <div className="profile-icon | material-icons">face</div>
                          <p className="profile-name">Name</p>
                      </div>

                      <a href="">
                          <span className="material-icons">edit</span>
                          <span>Edit Profile</span>
                      </a>

                      <a href="">
                          <span className="material-icons">logout</span>
                          <span>Logout</span>
                      </a>

                      <div className="account-exit-button | exit-button">
                          <span className="material-icons">close</span>
                      </div>
                  </div>

                  <div className="settings-overlay">
                      <h2>Settings</h2>

                      <a href="">
                          <span className="material-icons">speaker</span>
                          <span>Audio</span>
                      </a>

                      <a href="">
                          <span className="material-icons">videocam</span>
                          <span>Video</span>
                      </a>

                      <a href="">
                          <span className="material-icons">tune</span>
                          <span>General</span>
                      </a>

                      <div className="settings-exit-button | exit-button">
                          <span className="material-icons">close</span>
                      </div>
                  </div>

                  <div className="form-overlay">
                      <h2>Enter Meeting Code</h2>
                      <div className="form-buttons">
                          <input className="form__input" type="text" name="join-conference" autoFocus />
                          <a href="" className="join">
                              <span>Join</span>
                          </a>
                          <a href="" className="back-button">
                              <span>Back</span>
                          </a>
                      </div>
                  </div>
              </section>
          </body>
      </html>
);      
};

