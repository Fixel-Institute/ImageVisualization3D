import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import {
  AppBar,
  Button,
  Box,
  Drawer,
  Divider,
  Dialog,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Toolbar,
  Typography,
  TextField,
} from "@mui/material";


import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Auth from "views/Auth.js";

import { Session } from "sessions/Session.js";
import { useVisualizerContext } from "context";

const AuthLayout = () => {
  const navigate = useNavigate();
  const [context, dispatch] = useVisualizerContext();
  const { darkMode, server, user } = context;

  const cacheUrl = Session.getServer();
  const [serverAddress, setServerAddress] = React.useState({show: false, url: cacheUrl == "" ? window.location.hostname : cacheUrl});

  React.useEffect(() => {
    Session.verifyAccess().then((result) => {
      if (Object.keys(result).length === 0) {
        navigate("/auth", {replace: true})
      }
      dispatch({type: "user", value: result});
    });
  }, []);

  const updateServerAddress = () => {
    Session.setServer(serverAddress.url);
    setServerAddress({...serverAddress, show: false});
  };

  return <>
  <Box minHeight={"100vh"} style={{background: "white", overflow: "hidden"}}>
    <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton style={{color: "#FFFFFF"}} onClick={() => navigate("/index", {replace: true})}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h5"
          component="div"
          sx={{ flexGrow: 1, display: { sm: 'block' } }}
        >
          Change Account
        </Typography>
        
        <Box sx={{ display: { sm: 'block' } }}>
          <Button sx={{ color: '#fff' }} onClick={() => setServerAddress({...serverAddress, show: true})}>
            {"Change Server"}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
    
    <Dialog 
      open={serverAddress.show}
      onClose={() => setServerAddress({...serverAddress, show: false, url: cacheUrl == "" ? window.location.hostname : cacheUrl})}
      fullWidth
    >
      <Box sx={{
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      }}>
        <Box display={"flex"} sx={{width: "100%"}} flexDirection={"column"}>
          <TextField value={serverAddress.url} onChange={(event) => setServerAddress({...serverAddress, url: event.target.value})} label={"Image Host Address"}/>

          <Button variant="contained" size="large" onClick={() => updateServerAddress()} sx={{marginTop: 3}}> {"Update Server Address"} </Button>
        </Box>
      </Box>
    </Dialog>
    
    <Routes>
      <Route path="/" element={<Auth />}/>
      <Route path="/*" element={<Navigate to="/auth" replace />}/>
    </Routes>
  </Box>
  </>
};

export default AuthLayout;