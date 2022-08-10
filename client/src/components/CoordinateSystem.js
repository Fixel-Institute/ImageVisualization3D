import * as THREE from "three";

function CoordinateSystem(length, origin) {
  const xDir = new THREE.Vector3(1, 0, 0);
  const yDir = new THREE.Vector3(0, 1, 0);
  const zDir = new THREE.Vector3(0, 0, 1);

  const centroid = new THREE.Vector3(origin[0], origin[1], origin[2]);
  const arrowHelper = [
    new THREE.ArrowHelper(xDir, centroid, length, "#FF0000"),
    new THREE.ArrowHelper(yDir, centroid, length, "#00FF00"),
    new THREE.ArrowHelper(zDir, centroid, length, "#0000FF"),
  ];
  return arrowHelper
}

export default CoordinateSystem;