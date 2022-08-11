import * as THREE from "three";
import React from "react";

function Tractography({pointArray, color, linewidth}) {
  const points = [];
  for (var point of pointArray) {
    points.push(new THREE.Vector3(point[0], point[1], point[2]));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({color: color, linewidth: linewidth});
  return <line args={[geometry, material]}/>
}

export default Tractography;