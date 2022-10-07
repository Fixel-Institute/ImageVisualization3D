import React from "react";

function Model({geometry, material, matrix}) {
  return <mesh castShadow matrixAutoUpdate={false} matrix={matrix}>
    <bufferGeometry attach="geometry" attributes={{
      position: geometry.position,
      normal: geometry.normal
    }}/>
    <meshPhongMaterial transparent opacity={material.opacity} depthWrite={material.opacity > 0.9} color={material.color} specular={material.specular} shininess={material.shininess} />
  </mesh>
};

export default Model;