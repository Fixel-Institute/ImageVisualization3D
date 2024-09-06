/**
=========================================================
* UF BRAVO Platform
=========================================================

* Copyright 2023 by Jackson Cagle, Fixel Institute
* The source code is made available under a Creative Common NonCommercial ShareAlike License (CC BY-NC-SA 4.0) (https://creativecommons.org/licenses/by-nc-sa/4.0/) 

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect } from "react";

import {
  CircularProgress,
  Backdrop,
  Box,
  Typography
} from "@mui/material";

export default function LoadingProgress({text}) {
  return (
    <Backdrop
      sx={{ color: '#FFFFFF', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={true}
      onClick={() => {}}
    >
      <Box display={"flex"} alignItems={"center"} flexDirection={"column"}>
        <Typography color={"white"} fontWeight={"bold"} fontSize={30}>
          {text ? text : "Currently Loading"}
        </Typography>
        <CircularProgress color={"info"} />
      </Box>
    </Backdrop>
  )
}