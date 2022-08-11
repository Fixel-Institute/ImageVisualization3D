import React from "react";
import { Routes, Route } from "react-router-dom";

import {
  AppBar,
  Button,
  Box,
  Grid,
  IconButton,
  Toolbar,
  Typography
} from "@mui/material";

import LightModeIcon from '@mui/icons-material/LightMode';
import SceneRenderer from "views/SceneRenderer.js";

import { useVisualizerContext } from "context";

import 'assets/css/stats.css';
import { Stats } from "@react-three/drei";

const ImageViewerLayout = () => {

  const [context, dispatch] = useVisualizerContext();
  const { darkMode, server } = context;

  const toggleLightMode = () => {
    dispatch({type: "darkMode", value: !darkMode});
  }

  return <>
  <Stats showPanel={0} className={"stats"} /> 
  <Box minHeight={"100vh"} style={{background: darkMode ? "black" : "white", overflow: "hidden"}}>
    <AppBar position="sticky">
      <Toolbar>
        <Typography
          variant="h5"
          component="div"
          sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
        >
          Image Visualization 3D
        </Typography>
        
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <IconButton sx={{ color: '#fff' }} onClick={() => toggleLightMode()}>
            <LightModeIcon/>
          </IconButton>
        </Box>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Button sx={{ color: '#fff' }}>
            {"Change Server"}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
    <Routes>
      <Route path="/" element={<SceneRenderer />}/>
    </Routes>
  </Box>
  </>
};

export default ImageViewerLayout;