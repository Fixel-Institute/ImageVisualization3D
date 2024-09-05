import { useEffect, useState } from 'react';
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Session } from 'sessions/Session';

function GLBLoader({url, worldMatrix, matrix, updateController}) {
  //const gltf = useLoader(GLTFLoader, url);

  const [gltf, setGLTF] = useState(null);
  const [scene, setScene] = useState({});

  useEffect(() => {
    const gltfLoader = new GLTFLoader();
    console.log(url)
    gltfLoader.load(url, (data) => {
      console.log(data)
      setGLTF(data);
      setScene(data.scene);
    }, (xhr) => {
      //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    }, (error) => {
      console.log(error)
    });
  }, [url])

  return (
    <primitive position={[0, 0, 0]} object={scene} scale={1} />
  );
};

export default GLBLoader;