import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import {
  AppBar,
  Button,
  Box,
  Drawer,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Toolbar,
  Typography
} from "@mui/material";

import LightModeIcon from '@mui/icons-material/LightMode';
import Auth from "views/Auth.js";

import { Session } from "sessions/Session.js";
import { useVisualizerContext } from "context";

const AuthLayout = () => {
  const navigate = useNavigate();
  const [context, dispatch] = useVisualizerContext();
  const { darkMode, server, user } = context;

  React.useEffect(() => {
    Session.verifyAccess().then((result) => {
      if (Object.keys(result).length === 0) {
        navigate("/auth", {replace: true})
      }
      dispatch({type: "user", value: result});
    });
  }, []);

  return <>
  <Box minHeight={"100vh"} style={{background: "white", overflow: "hidden"}}>
    <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography
          variant="h5"
          component="div"
          sx={{ flexGrow: 1, display: { sm: 'block' } }}
        >
          Change Account
        </Typography>
        
        <Box sx={{ display: { sm: 'block' } }}>
          <Button sx={{ color: '#fff' }}>
            {"Change Server"}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
    <Routes>
      <Route path="/" element={<Auth />}/>
      <Route path="/*" element={<Navigate to="/auth" replace />}/>
    </Routes>
  </Box>
  </>
};

export default AuthLayout;