import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import React from 'react';
import LoginPage from './Components/Pages/Login/Login';
import Sidebar from './Components/SideBar/SideBar';
import Home from './Components/Pages/Home';
import Team from './Components/Pages/Team';
import styled from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import ContactDataDoc from './Components/Pages/ContactDataDoc';
import ContactDataDocUtility from './Components/Pages/ContactDataDocUtility';
import SearchPage from './Components/Pages/SearchPage/SearchPage';
import SearchPageUtility from './Components/Pages/SearchPage/SearchPageUtility';
import EventGroupMaster from './Components/Pages/EventGroup/EventGroupMaster';
import EventGroupUtility from './Components/Pages/EventGroup/EventGroupUtility';
import { ContactProvider } from './Components/Pages/ContactContext'; 
import UserCreationUtility from './Components/UserCreation/UserCreationUtility';
import UserCreationComponent from "../src/Components/UserCreation/UserCreationCompoenent";
import OrganizationNameSearchPage from './Components/Pages/OrganizationNameSearchPage/OrganizationNameSearchPage';
import OrganizationNameSearchPageUtility from './Components/Pages/OrganizationNameSearchPage/OrganizationNameSearchPageUtility';
import ProtectedRoute from '../src/Components/ProtectedRoute'; // Import your ProtectedRoute component

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

  return (
    <>
      {showSidebar && <Sidebar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LoginPage />} />

          {/* Protected routes based on roles */}
          <Route
            path="/home"
            element={
              <ProtectedRoute allowedRoles={['A', 'E', 'V']}>
                <Pages><OrganizationNameSearchPage /></Pages>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contact-data-org"
            element={
              <ProtectedRoute allowedRoles={['A', 'E', 'V']}>
                <Pages><OrganizationNameSearchPageUtility /></Pages>
              </ProtectedRoute>
            }
          />

          <Route
            path="/Team"
            element={
              <ProtectedRoute allowedRoles={['A', 'E', 'V']}>
                <Pages><Team /></Pages>
              </ProtectedRoute>
            }
          />

          <Route
            path="/documents"
            element={
              <ProtectedRoute allowedRoles={['A', 'E','V']}>
                <Pages><ContactDataDocUtility /></Pages>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contactData"
            element={
              <ProtectedRoute allowedRoles={['A', 'E','V']}>
                <Pages><ContactDataDoc /></Pages>
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects"
            element={
              <ProtectedRoute allowedRoles={['A', 'E','V']}>
                <Pages><SearchPage /></Pages>
              </ProtectedRoute>
            }
          />

          <Route
            path="/contact-data-event-code"
            element={
              <ProtectedRoute allowedRoles={['A', 'E','V']}>
                <Pages><SearchPageUtility /></Pages>
              </ProtectedRoute>
            }
          />

          <Route
            path="/calender"
            element={
              <ProtectedRoute allowedRoles={['A', 'E','V']}>
                <Pages><EventGroupUtility /></Pages>
              </ProtectedRoute>
            }
          />

          <Route
            path="/event-group-master"
            element={
              <ProtectedRoute allowedRoles={['A','E','V']}>
                <Pages><EventGroupMaster /></Pages>
              </ProtectedRoute>
            }
          />

          <Route
            path="/usercreationutility"
            element={
              <ProtectedRoute allowedRoles={['A']}>
                <Pages><UserCreationUtility /></Pages>
              </ProtectedRoute>
            }
          />

          <Route
            path="/user_Creation"
            element={
              <ProtectedRoute allowedRoles={['A']}>
                <Pages><UserCreationComponent /></Pages>
              </ProtectedRoute>
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
