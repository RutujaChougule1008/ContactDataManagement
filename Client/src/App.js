import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import LoginPage from './Components/Pages/Login/Login';
import Sidebar from './Components/SideBar/SideBar';
import Home from './Components/Pages/Home';
import Team from './Components/Pages/Team';
import styled from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import ContactDataDoc from './Components/Pages/ContactDataDoc';
import ContactDataDocUtility from './Components/Pages/ContactDataDocUtility'
import SearchPage from './Components/Pages/SearchPage/SearchPage'
import SearchPageUtility from './Components/Pages/SearchPage/SearchPageUtility'
import EventGroupMaster from './Components/Pages/EventGroup/EventGroupMaster';
import EventGroupUtility from './Components/Pages/EventGroup/EventGroupUtility';
import { ContactProvider } from '../src/Components/Pages/ContactContext'; 
import UserCreationUtility from './Components/UserCreation/UserCreationUtility';
import UserCreationCompoenent from "./Components/UserCreation/UserCreationCompoenent"
import OrganizationNameSearchPage from './Components/Pages/OrganizationNameSearchPage/OrganizationNameSearchPage';
import OrganizationNameSearchPageUtility from './Components/Pages/OrganizationNameSearchPage/OrganizationNameSearchPageUtility';

const Pages = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  h1 {
    font-size: calc(2rem + 2vw);
    background: linear-gradient(to right, #803bec 30%, #1b1b1b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

function App() {
  const location = useLocation();

  const showSidebar = location.pathname !== '/';

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const confirmationMessage = 'Are you sure you want to leave? Your changes may not be saved.';
      event.preventDefault();
      event.returnValue = confirmationMessage;
      return confirmationMessage;
    };

    // Attach event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);


  return (
    <>
      {showSidebar && <Sidebar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/home"
            element={
              <Pages>
                <OrganizationNameSearchPage/>
              </Pages>
            }
          />

<Route
            path="/contact-data-org"
            element={
              <Pages>

                <OrganizationNameSearchPageUtility />
              </Pages>
            }
          />
          <Route
            path="/Team"
            element={
              <Pages>
                <Team />
              </Pages>
            }
          />
          <Route
            path="/documents"
            element={
              <Pages>

                <ContactDataDocUtility />
              </Pages>
            }
          />

<Route
            path="/contactData"
            element={
              <Pages>
                <ContactDataDoc />
              </Pages>
            }
          />

<Route
            path="/projects"
            element={
              <Pages>
                <SearchPage />
              </Pages>
            }
          />
          <Route
            path="/contact-data-event-code"
            element={
              <Pages>
                <SearchPageUtility />
              </Pages>
            }
          />
          <Route
            path="/calender"
            element={
              <Pages>
                <EventGroupUtility />
              </Pages>
            }
          />
           <Route
            path="/event-group-master"
            element={
              <Pages>
                <EventGroupMaster />
              </Pages>
            }
          />
              <Route
            path="/usercreationutility"
            element={
              <Pages>
                <UserCreationUtility />
              </Pages>
            }
          />
          <Route
            path="/user_Creation"
            element={
              <Pages>
                <UserCreationCompoenent />
              </Pages>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function AppWithRouter() {
  return (
    <Router>
    <ContactProvider>
      <App />
      </ContactProvider>
      </Router>
  );
}

export default AppWithRouter;
