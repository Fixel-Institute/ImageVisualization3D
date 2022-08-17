import {
  Texture,
  LinearFilter,
  DoubleSide,
  MeshBasicMaterial,
  ClampToEdgeWrapping,
  Vector3,
  DataArrayTexture,
  DataTexture,
  Matrix4,
} from "three";

import {
  useThree
} from "@react-three/fiber";

import * as math from "mathjs";

function mapRange() {

}

function extractSlice(data, dimension, slice_index, axis) {
  switch (axis) {
    case 'x': {
      const slice_data = new Array(dimension[1]*dimension[2]);
      for (var i = 0; i < dimension[1]; i++) {
        for (var j = 0; j < dimension[2]; j++) {
          slice_data[i + j*dimension[1]] = data._data[slice_index][i][j];
        } 
      }
      return slice_data;
    }

    case 'y': {
      const slice_data = new Array(dimension[0]*dimension[2]);
      for (var i = 0; i < dimension[0]; i++) {
        for (var j = 0; j < dimension[2]; j++) {
          slice_data[i + j*dimension[0]] = data._data[i][slice_index][j];
        } 
      }
      return slice_data;
    }

    case 'z':
    default: {
      const slice_data = new Array(dimension[0]*dimension[1]);
      for (var i = 0; i < dimension[0]; i++) {
        for (var j = 0; j < dimension[1]; j++) {
          slice_data[i + j*dimension[0]] = data._data[i][j][slice_index];
        } 
      }
      return slice_data;
    }
  }
}

function colorMapping(value, clim, cmap) {
  switch (cmap) {
    case "grayscale":
    default: {
      const intensity = Math.floor((value - clim[0]) / (clim[1]-clim[0]) * 255);
      return [intensity, intensity, intensity, 255];
    }
  }
}

function createTexture(data, width, height, clim) {
  const size = width * height;
  const cdata = new Uint8Array(4*size);

  for (let i = 0; i < size; i++) {
    const stride = i * 4;
    const color = colorMapping(data[i], clim);
    cdata[stride] = color[0];
    cdata[stride + 1] = color[1];
    cdata[stride + 2] = color[2];
    cdata[stride + 3] = color[3];
  }

  return new DataTexture(cdata, width, height);
}

function dragControl(event) {
  console.log(event)
}

function VolumetricSlice({data, sliceIndex, axis, matrix}) {
  const slice = extractSlice(data.data, data.dimensions, sliceIndex, axis);

  if (axis == "z") {
    const offset_matrix = new Matrix4();
    offset_matrix.makeTranslation(-data.xRange._data[Math.floor(data.dimensions[0]/2)], -data.yRange._data[Math.floor(data.dimensions[1]/2)], -data.zRange._data[data.dimensions[2]-1]);

    const canvasMap = createTexture(slice, data.dimensions[0], data.dimensions[1], [-data.windowHigh, data.windowHigh]);
    canvasMap.minFilter = LinearFilter;
    canvasMap.wrapS = canvasMap.wrapT = ClampToEdgeWrapping;
    canvasMap.needsUpdate = true;

    const slice_position = new Matrix4().makeTranslation(0,0,data.zRange._data[sliceIndex]);
    const position = new Matrix4().makeRotationZ(Math.PI).premultiply(offset_matrix).premultiply(matrix).multiply(slice_position);
    return <mesh matrixAutoUpdate={false} matrix={position} onWheel={(event) => dragControl(event)}>
      <planeGeometry args={[data.dimensions[0],data.dimensions[1]]} />
      <meshBasicMaterial map={canvasMap} side={DoubleSide} transparent={true}/>
    </mesh>

  } else if (axis == "y") {
    const offset_matrix = new Matrix4();
    offset_matrix.makeTranslation(-data.xRange._data[Math.floor(data.dimensions[0]/2)], 0, -data.zRange._data[Math.floor(data.dimensions[2]/2)]);

    const canvasMap = createTexture(slice, data.dimensions[0], data.dimensions[2], [data.windowLow, data.windowHigh]);
    canvasMap.minFilter = LinearFilter;
    canvasMap.wrapS = canvasMap.wrapT = ClampToEdgeWrapping;
    canvasMap.needsUpdate = true;

    const slice_position = new Matrix4().makeTranslation(0,0,data.yRange._data[sliceIndex]);
    const position = new Matrix4().makeRotationX(Math.PI/2).premultiply(offset_matrix).premultiply(matrix).multiply(slice_position);
    return <mesh matrixAutoUpdate={false} matrix={position}>
      <planeGeometry args={[data.dimensions[0],data.dimensions[2]]} />
      <meshBasicMaterial map={canvasMap} side={DoubleSide} transparent={true}/>
    </mesh>

  } else if (axis == "x") {
    const offset_matrix = new Matrix4();
    offset_matrix.makeTranslation(0, -data.yRange._data[Math.floor(data.dimensions[1]/2)], -data.zRange._data[Math.floor(data.dimensions[2]/2)]);

    const canvasMap = createTexture(slice, data.dimensions[1], data.dimensions[2], [data.windowLow, data.windowHigh]);
    canvasMap.minFilter = LinearFilter;
    canvasMap.wrapS = canvasMap.wrapT = ClampToEdgeWrapping;
    canvasMap.needsUpdate = true;

    const slice_position = new Matrix4().makeTranslation(0,0,data.xRange._data[sliceIndex]);
    const position = new Matrix4().makeRotationY(-Math.PI/2).multiply(new Matrix4().makeRotationZ(-Math.PI/2)).premultiply(offset_matrix).premultiply(matrix).multiply(slice_position);
    return <mesh matrixAutoUpdate={false} matrix={position}>
      <planeGeometry args={[data.dimensions[1],data.dimensions[2]]} />
      <meshBasicMaterial map={canvasMap} side={DoubleSide} transparent={true}/>
    </mesh>
  }
}

function VolumetricObject({data, matrix}) {
  console.log(data)

  const coordinateTransformation = new Matrix4();
  coordinateTransformation.set(-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  
  const tform = math.transpose(math.inv(math.matrix(data.matrix.toArray()).reshape([4,4])));
  const invertedTForm = new Matrix4().set(...tform.reshape([16])._data);

  return <group matrixAutoUpdate={false} matrix={coordinateTransformation}>
    <VolumetricSlice data={data} sliceIndex={150} axis={"z"} matrix={invertedTForm} />
    <VolumetricSlice data={data} sliceIndex={255} axis={"y"} matrix={invertedTForm} />
    <VolumetricSlice data={data} sliceIndex={255} axis={"x"} matrix={invertedTForm} />
  </group>
}

export default VolumetricObject;