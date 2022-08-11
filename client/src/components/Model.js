import * as THREE from "three";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

import { Session } from "sessions/Session.js";

export function parseBinarySTL(data) {
  const reader = new DataView( data );
  const faces = reader.getUint32( 80, true );

  let r, g, b, hasColors = false, colors;
  let defaultR, defaultG, defaultB, alpha;

  // process STL header
  // check for default color in header ("COLOR=rgba" sequence).

  for ( let index = 0; index < 80 - 10; index ++ ) {
    if ( ( reader.getUint32( index, false ) == 0x434F4C4F /*COLO*/ ) &&
      ( reader.getUint8( index + 4 ) == 0x52 /*'R'*/ ) &&
      ( reader.getUint8( index + 5 ) == 0x3D /*'='*/ ) ) {

      hasColors = true;
      colors = new Float32Array( faces * 3 * 3 );

      defaultR = reader.getUint8( index + 6 ) / 255;
      defaultG = reader.getUint8( index + 7 ) / 255;
      defaultB = reader.getUint8( index + 8 ) / 255;
      alpha = reader.getUint8( index + 9 ) / 255;
    }
  }

  const dataOffset = 84;
  const faceLength = 12 * 4 + 2;

  const vertices = new Float32Array( faces * 3 * 3 );
  const normals = new Float32Array( faces * 3 * 3 );

  for ( let face = 0; face < faces; face ++ ) {
    const start = dataOffset + face * faceLength;
    const normalX = reader.getFloat32( start, true );
    const normalY = reader.getFloat32( start + 4, true );
    const normalZ = reader.getFloat32( start + 8, true );

    if ( hasColors ) {
      const packedColor = reader.getUint16( start + 48, true );
      if ( ( packedColor & 0x8000 ) === 0 ) {
        // facet has its own unique color
        r = ( packedColor & 0x1F ) / 31;
        g = ( ( packedColor >> 5 ) & 0x1F ) / 31;
        b = ( ( packedColor >> 10 ) & 0x1F ) / 31;
      } else {
        r = defaultR;
        g = defaultG;
        b = defaultB;
      }
    }

    for ( let i = 1; i <= 3; i ++ ) {

      const vertexstart = start + i * 12;
      const componentIdx = ( face * 3 * 3 ) + ( ( i - 1 ) * 3 );

      vertices[ componentIdx ] = reader.getFloat32( vertexstart, true );
      vertices[ componentIdx + 1 ] = reader.getFloat32( vertexstart + 4, true );
      vertices[ componentIdx + 2 ] = reader.getFloat32( vertexstart + 8, true );
      normals[ componentIdx ] = normalX;
      normals[ componentIdx + 1 ] = normalY;
      normals[ componentIdx + 2 ] = normalZ;

      if ( hasColors ) {
        colors[ componentIdx ] = r;
        colors[ componentIdx + 1 ] = g;
        colors[ componentIdx + 2 ] = b;
      }
    }
  }

  return {
    position: new THREE.BufferAttribute( vertices, 3 ),
    normal: new THREE.BufferAttribute( normals, 3 )
  };
}

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