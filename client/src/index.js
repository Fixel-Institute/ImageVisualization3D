import React from 'react';
import ReactDOM from 'react-dom/client';
import { Routes, Route, BrowserRouter } from "react-router-dom";

import { VisualizerContextProvider, useVisualizationContext } from 'context';
import { ThemeProvider } from '@emotion/react';
import theme from "assets/theme/mui-theme.js";

import ImageViewerLayout from "layout/ImageViewer.js";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <VisualizerContextProvider initialStates={{darkMode: true, server: window.location.protocol + '//' + window.location.host}}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<ImageViewerLayout />}/>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </VisualizerContextProvider>
  </React.StrictMode>
);

