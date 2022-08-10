import React from "react";
import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls"

import { 
  Box 
} from "@mui/material";

import CoordinateSystem from "components/CoordinateSystem.js";

function SceneRenderer() {
  const ref = React.createRef(null);

  React.useEffect(() => {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1e10);
    camera.position.set(0, 0, 300);
    camera.lookAt(0, 0, 0);
    scene.add(camera);
  
    const material = new THREE.LineBasicMaterial( {color: "#0000ff"} );
    const points = [];
    points.push(new THREE.Vector3(-10, 0, 0));
    points.push(new THREE.Vector3(0, 10, 0));
    points.push(new THREE.Vector3(10, 0, 0));
    points.push(new THREE.Vector3(10, 100, 0));
  
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    const arrowHelper = CoordinateSystem(50, [-100,0,0]);
    for (var obj of arrowHelper) {
      scene.add(obj);
    }

    const renderer = new THREE.WebGL1Renderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    ref.current.appendChild(renderer.domElement);
    
    const controls = new TrackballControls(camera, renderer.domElement);
    controls.minDistance = 100;
    controls.maxDistance = 500;
    controls.rotateSpeed = 5;
    controls.zoomSpeed = 5;
    controls.panSpeed = 2;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();
  }, []);
  
  return <>
    <Box ref={ref}>

    </Box>
  </>
}

export default SceneRenderer;