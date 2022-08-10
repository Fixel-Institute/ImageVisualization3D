import React from "react";
import { Routes, Route } from "react-router-dom";

import SceneRenderer from "views/SceneRenderer.js";

import {
  Box,
  Grid
} from "@mui/material";

const ImageViewerLayout = () => {
  return <>
    <Box minHeight={"100vh"} style={{background: "black", overflow: "hidden"}}>
      <Routes>
        <Route path="/" element={<SceneRenderer />}/>
      </Routes>
    </Box>
  </>
};

export default ImageViewerLayout;