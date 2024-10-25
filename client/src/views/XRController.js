import React from "react";

import { useThree } from '@react-three/fiber'
import { VRButton } from 'three/addons/webxr/VRButton.js';

import { ArcballControls } from "three/examples/jsm/controls/ArcballControls"
//import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TrackballControls, OrbitControls } from "@react-three/drei";

function XRController ({enabled}) {
  const { gl } = useThree();

  React.useEffect(() => {
    gl.xr.enabled = enabled;
    if (gl.xr.enabled) {
        const childButton = VRButton.createButton(gl);
        document.body.appendChild(childButton);
        return () => {
            document.body.removeChild(childButton);
        }
    }
  }, [enabled])

  return null
}

export default XRController
