import React, { useState, useEffect } from 'react';
import { Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const userRole = sessionStorage.getItem('user_type'); 
  const [showAlert, setShowAlert] = useState(false); 

  useEffect(() => {
    if (!allowedRoles.includes(userRole)) {
      setShowAlert(true); 
    }
  }, [allowedRoles, userRole]);

  const handleClose = () => {
    setShowAlert(false); 
  };

  if (!userRole || !allowedRoles.includes(userRole)) {
    return (
      <>
        {showAlert && (
          <Dialog
            open={showAlert}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{"Access Denied"}</DialogTitle>
            <DialogContent>
              <Alert severity="error">
                You are not authorized to access this page.
              </Alert>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary" autoFocus>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </>
    );
  }

  return children; 
};

export default ProtectedRoute;
