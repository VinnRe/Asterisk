import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import accountIcon from '../../Assets/home_assets/account-icon.svg';
import joinIcon from '../../Assets/home_assets/join-icon.svg';
import addIcon from '../../Assets/home_assets/add-icon.svg';
import '../../Styles/home_styles.css';

export const HomePage = () => {
    useEffect(() => {
        const anchor = document.querySelector(".button__anchor");
        const backButton = document.querySelector(".form-button--back");
        const buttonConferenceJoin = document.querySelector(".button--conference-join");
        const buttonConferenceCreate = document.querySelector(".button--conference-create");
        const formHidden = document.querySelector(".form--hidden");
    
        if (anchor && backButton && buttonConferenceJoin && buttonConferenceCreate && formHidden) {
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
        }
      }, []); // Empty dependency array ensures this effect runs once after the initial render
    
      return (
        <body className="home-page">
          <div className="page-container">
            <header>
              <h1 className="header__name--large">Asterisk</h1>
        
              <div className="card--icon-account">
                <a className="button__anchor--icon-account" href="">
                  <img className="img--icon-account" src={accountIcon} alt="Account Icon" />
                  <p>Account Name</p>
                </a>
              </div>
            </header>
        
            <main>
              <section className="section section--conference">
                <div className="button--conference button--conference-join">
                  <Link to="/join">
                    <img className="img--conference" src={joinIcon} alt="Join Icon" />
                    <p>Join</p>
                  </Link>
                </div>
        
                <form className="form form--hidden" action="">
                  <label htmlFor="conference-join">Enter Meeting Code</label>
                  <input
                    className="form__input"
                    type="text"
                    name="conference-join"
                    id="join-conference"
                    placeholder="Code"
                    autoFocus
                  />
                  <div className="form__buttons">
                    <input className="form__submit" type="submit" value="Enter" />
                    <button className="form-button--back">Back</button>
                  </div>
                </form>
        
                <div className="button--conference button--conference-create">
                  <Link to="/create">
                    <img className="img--conference" src={addIcon} alt="Add Icon" />
                    <p>Create</p>
                  </Link>
                </div>
              </section>
        
              <section className="section section--features">
                <button className="button--feature">
                  <p>Feature 1</p>
                </button>
        
                <button className="button--feature">
                  <p>Feature 2</p>
                </button>
        
                <button className="button--feature">
                  <p>Feature 3</p>
                </button>
              </section>
            </main>
          </div>
        </body>
      );      
};

