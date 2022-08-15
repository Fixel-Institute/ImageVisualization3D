import React from "react";
import * as THREE from "three";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

import { Session } from "sessions/Session.js";

function Model({geometry, material, matrix}) {

  /*
  const objectRef = React.useRef();
  React.useEffect(() => { 
    if (objectRef.current) {
      //objectRef.current.matrixAutoUpdate = false;
      //objectRef.current.matrix.set(...matrix);
    }
  }, [objectRef]);
  */
  const worldMatrix = new THREE.Matrix4();
  worldMatrix.set(...matrix);
  return <mesh castShadow matrixAutoUpdate={false} matrix={worldMatrix}>
    <bufferGeometry attach="geometry" attributes={{
      position: geometry.position,
      normal: geometry.normal
    }}/>
    <meshPhongMaterial transparent opacity={material.opacity} color={material.color} specular={material.specular} shininess={material.shininess} />
  </mesh>
};

export default Model;