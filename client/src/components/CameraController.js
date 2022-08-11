import React from "react";

import { useThree } from '@react-three/fiber'

import { ArcballControls } from "three/examples/jsm/controls/ArcballControls"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TrackballControls } from "@react-three/drei";

function CameraController () {
  const { camera, scene, gl } = useThree();

  React.useEffect(() => {
    camera.position.set(-200, 0, 0);
    camera.lookAt(0, 0, 0);
  }, [])

  return <TrackballControls camera={camera} domElement={gl.domElement} minDistance={20} maxDistance={200} rotateSpeed={5} zoomSpeed={1} panSpeed={0.5} />
}

export default CameraController