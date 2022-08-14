import * as THREE from "three";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

import { Session } from "sessions/Session.js";

function Model({geometry, material}) {
  return <mesh castShadow>
    <bufferGeometry attach="geometry" attributes={{
      position: geometry.position,
      normal: geometry.normal
    }}/>
    <meshPhongMaterial transparent opacity={material.opacity} color={material.color} specular={material.specular} shininess={material.shininess} />
  </mesh>
};

export default Model;