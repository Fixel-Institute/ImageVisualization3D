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

import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import Admin from "views/Admin.js";
import Auth from "views/Auth.js";

import { useVisualizerContext } from "context";
import { Session } from "sessions/Session";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [context, dispatch] = useVisualizerContext();
  const { darkMode, server, user } = context;
  
  const [menuOpen, setMenuOpen] = React.useState(true);

  React.useEffect(() => {
    Session.verifyAccess().then((result) => {
      if (Object.keys(result).length === 0) {
        navigate("/auth", {replace: true});
      }
      
      if (!result.isAdmin) {
        navigate("/auth", {replace: true});
      }
      dispatch({type: "user", value: result});
    });
  }, []);

  const logout = () => {
    Session.logout();
    dispatch({type: "user", value: {}});
    navigate("/auth", {replace: true});
  }

  return user.isAdmin ? <>
  <Box minHeight={"100vh"} style={{background: "white", overflow: "hidden"}}>
    <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h5"
          component="div"
          sx={{ flexGrow: 1, display: { sm: 'block' } }}
        >
          Admin Interface
        </Typography>
        
        <Box sx={{ display: { sm: 'block' } }}>
          <Button onClick={() => logout()} sx={{ color: '#fff' }}>
            {"Log Out"}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
    <Routes>
      <Route path="/dashboard" element={<Admin menuOpen={menuOpen} setMenuOpen={setMenuOpen} />}/>
      <Route path="/*" element={<Navigate to="/admin/dashboard" replace />}/>
    </Routes>
  </Box>
  </> : null;
};

export default AdminLayout;