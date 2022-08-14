import React from 'react';
import ReactDOM from 'react-dom/client';
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";

import { VisualizerContextProvider, useVisualizationContext } from 'context';
import { ThemeProvider } from '@emotion/react';
import theme from "assets/theme/mui-theme.js";

import ImageViewerLayout from "layout/ImageViewer.js";
import AdminLayout from 'layout/Admin.js';
import AuthLayout from 'layout/Auth.js';

import 'assets/css/customize.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <VisualizerContextProvider initialStates={{darkMode: true, server: window.location.protocol + '//' + window.location.host, user: {}}}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            <Route path="/auth/*" element={<AuthLayout />}/>
            <Route path="/admin/*" element={<AdminLayout />}/>
            <Route index path="/index" element={<ImageViewerLayout />}/>
            <Route path="/*" element={<Navigate to="/index" replace />}/>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </VisualizerContextProvider>
  </React.StrictMode>
);

