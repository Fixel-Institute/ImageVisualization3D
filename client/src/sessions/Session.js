import axios from "axios";
import * as THREE from "three";
import cookie from "react-cookies";
import * as math from "mathjs";
import { Volume } from "three/examples/jsm/misc/Volume";
import { VolumeSlice } from "three/examples/jsm/misc/VolumeSlice";
import { Matrix3 } from "three";

function rgbaToHex (r,g,b,a) {
  var outParts = [
    r.toString(16),
    g.toString(16),
    b.toString(16),
  ];

  // Pad single-digit output values
  outParts.forEach(function (part, i) {
    if (part.length === 1) {
      outParts[i] = '0' + part;
    }
  })

  return ('#' + outParts.join(''));
}

function parseBinarySTL(data) {
  const reader = new DataView( data );
  const faces = reader.getUint32( 80, true );
  console.log(faces)

  let r, g, b, hasColors = false, colors;
  let defaultR, defaultG, defaultB, alpha;

  var colorString = "#FFFFFF";

  for ( let index = 0; index < 80 - 10; index ++ ) {
    if ( ( reader.getUint32( index, false ) == 0x434F4C4F /*COLO*/ ) &&
      ( reader.getUint8( index + 4 ) == 0x52 /*'R'*/ ) &&
      ( reader.getUint8( index + 5 ) == 0x3D /*'='*/ ) ) {
      
        colorString = rgbaToHex(reader.getUint8( index + 6 ), reader.getUint8( index + 7 ), reader.getUint8( index + 8 ));
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
    normal: new THREE.BufferAttribute( normals, 3 ),
    color: colorString
  };
}

function identityMatrix() {
  const matrix = new THREE.Matrix4();
  matrix.set(1, 0, 0, 0,
             0, 1, 0, 0,
             0, 0, 1, 0,
             0, 0, 0, 1);
  return matrix;
}

export var Session = (function () {
  var serverAddress = "";
  var configurations = {}

  const setServer = (url) => {
    serverAddress = url;
  };

  const syncSession = () => {
    query("/server/configurations").then((response) => {
      configurations = response.data;
    });
  };

  const authenticate = async (username, password) => {
    try {
      const response = await query("/server/authenticate", {
        Username: username,
        Password: password
      });
      if (response.status == 200) return response.data;
    } catch (error) {

    }
    return null;
  }

  const logout = () => {
    query("/server/logout");
  }

  const verifyAccess = async () => {
    try {
      const response = await query("/server/verify"); 
      if (response.status == 200) return response.data;
    } catch (error) {
      return {};
    }
  };

  const listDirectories = async () => {
    const response = await query("/server/listDirectories");
    const allDirectories = [];
    for (var folder of response.data) {
      allDirectories.push({
        value: folder,
        label: folder,
      });
    }
    return allDirectories;
  }

  const listModels = async (form) => {
    const response = await query("/server/listModels", form);
    const allItems = [];
    for (var file of response.data) {
      allItems.push({
        filename: file.file,
        type: file.type,
        mode: file.mode,
        data: null,
      });
    }
    return allItems;
  };

  const getModels = async (directory, item) => {
    const controlledItems = [];
    if (item.mode == "single") {
      
      if (item.type == "stl") {
        const response = await query("/server/getModel", {
          "Directory": directory,
          "FileName": item.filename,
          "FileMode": item.mode,
          "FileType": item.type
        }, {responseType: "arraybuffer"});
        const data = parseBinarySTL(response.data);
        controlledItems.push({
          filename: item.filename,
          type: item.type,
          downloaded: true,
          data: data,
          opacity: 1,
          color: data.color,
          matrix: identityMatrix(),
          show: true,
        });
      
      } else if (item.type == "volume") {
        const response = await query("/server/getModel", {
          "Directory": directory,
          "FileName": item.filename,
          "FileMode": item.mode,
          "FileType": item.type
        }, {responseType: "arraybuffer"});
        return response.data;

      } else if (item.type == "tracts") {
        const response = await query("/server/getModel", {
          "Directory": directory,
          "FileName": item.filename,
          "FileMode": item.mode,
          "FileType": item.type
        });
        controlledItems.push({
          filename: item.filename,
          type: item.type,
          downloaded: true,
          data: response.data.points,
          thickness: 1,
          color: "#FFFFFF",
          matrix: identityMatrix(),
          show: true,
        });

      } else if (item.type == "points") {
        const response = await query("/server/getModel", {
          "Directory": directory,
          "FileName": item.filename,
          "FileMode": item.mode,
          "FileType": item.type
        });
        controlledItems.push({
          filename: item.filename,
          type: item.type,
          downloaded: true,
          data: response.data.points,
          thickness: 1,
          color: "#FFFFFF",
          matrix: identityMatrix(),
          show: true,
        });

      } else if (item.type == "electrode") {
        const response = await query("/server/getModel", {
          "Directory": directory,
          "FileName": item.filename,
          "FileMode": item.mode,
          "FileType": item.type
        }, {responseType: "arraybuffer"});
        const data = parseBinarySTL(response.data);
        controlledItems.push({
          filename: item.filename,
          data: data,
          color: data.color,
        });

      }
      return controlledItems;

    } else if (item.mode == "multiple") {

      if (item.type === "electrode") {
        const pagination = await query("/server/getModel", {
          "Directory": directory,
          "FileName": item.filename,
          "FileMode": item.mode,
          "FileType": item.type
        });
  
        const targetPts = [0,0,0];
        const entryPts = [0,0,50];
  
        const electrode_data = {
          filename: item.filename,
          type: item.type,
          downloaded: true,
          subname: [],
          data: [],
          color: pagination.data.color,
          opacity: 1,
          targetPts: targetPts,
          entryPts: entryPts,
          matrix: computeElectrodePlacement(targetPts, entryPts),
          show: true,
        };
        for (var page of pagination.data.pages) {
          const data = await getModels(page.directory, {
            filename: page.filename,
            mode: "single",
            type: page.type
          });
          electrode_data.subname.push(data[0].filename);
          electrode_data.data.push(data[0].data);
        }
        return [electrode_data]

      } else if (item.type === "volume") {
        const header_response = await query("/server/getModel", {
          "Directory": directory,
          "FileName": item.filename,
          "FileMode": item.mode,
          "FileType": item.type
        });
        
        const volume = {};
        volume.header = header_response.data.headers;
        volume.dimensions = volume.header.size;
        volume.xRange = math.multiply(math.range(0,volume.header.size[0]), volume.header.pixdim[0]);
        volume.yRange = math.multiply(math.range(0,volume.header.size[1]), volume.header.pixdim[1]);
        volume.zRange = math.multiply(math.range(0,volume.header.size[2]), volume.header.pixdim[2]);
        volume.axisOrder = [ 'x', 'y', 'z' ];
        volume.spacing = volume.header.pixdim;
        volume.matrix = new THREE.Matrix4();
        volume.matrix.set(...volume.header.affine);
        
        const _data = await getModels(directory, {
          filename: item.filename,
          mode: "single",
          type: item.type
        });

        volume.data = new Uint16Array(_data);
        let min = Infinity;
        let max = - Infinity;
        const datasize = volume.data.length;
        for ( var i = 0; i < datasize; i ++ ) {
          if ( ! isNaN( volume.data[ i ] ) ) {
            const value = volume.data[ i ];
            min = Math.min( min, value );
            max = Math.max( max, value );
          }
        }
        volume.lowerThreshold = min;
        volume.upperThreshold = max;
        volume.windowLow = min;
        volume.windowHigh = max;

        return [{
          filename: item.filename,
          type: item.type,
          data: volume,
          color: "",
          matrix: identityMatrix(),
          show: true,
        }];
      }
    }
  }

  const setSessionConfig = async (directory, filename, type, value) => {
    await query("/server/configurations", {
      "SetConfiguration": true,
      "Directory": directory,
      "FileName": filename,
      "Type": type,
      "Value": value
    });
  }

  const computeElectrodePlacement = (targetPts, entryPts) => {
    const default_lead_model = math.matrix([[0,0,0,1],[0,1,0,1],[0,0,1,1],[1,0,0,1]]);
    const target = math.matrix(math.dotMultiply(targetPts, [-1, -1, 1]));
    const entry = math.matrix(math.dotMultiply(entryPts, [-1, -1, 1]));
    const zDirection = math.subtract(entry, target);

    const K = math.divide(zDirection, math.norm(zDirection));
    const temp = math.divide(math.subtract(math.add(target, 5), target), math.norm(math.subtract(math.add(target, 5), target)));
    const I = math.divide(math.subtract(0, math.cross(K, temp)), math.norm(math.subtract(0, math.cross(K, temp))));
    const J = math.divide(math.subtract(0, math.cross(I, K)), math.norm(math.subtract(0, math.cross(I, K))));
    
    const template_coordinates = math.matrix([target, math.add(K, target), math.add(J, target), math.add(I, target)]);
    const template_coordinates_matrix = math.resize(template_coordinates, [4,4], 1);
    const transform_matrix = math.transpose(math.multiply(math.inv(default_lead_model), template_coordinates_matrix));
    
    const affine_matrix = new THREE.Matrix4();
    affine_matrix.set(...transform_matrix.reshape([16])._data);
    return affine_matrix;
  }

  const computeTransformationMatrix = () => {

  }

  const getData = async (url, form) => {
    axios.defaults.headers.post["X-CSRFToken"] = cookie.load("csrftoken");
    axios.defaults.headers.post["Content-Type"] = "application/json";
    axios.defaults.headers.post["Accept"] = "application/json";
    return axios.get(serverAddress + url, form);
  };

  const query = async (url, form, config) => {
    axios.defaults.headers.post["X-CSRFToken"] = cookie.load("csrftoken");
    axios.defaults.headers.post["Content-Type"] = "application/json";
    axios.defaults.headers.post["Accept"] = "application/json";
    return axios.post(serverAddress + url, form, config);
  };

  return {
    setServer: setServer,
    authenticate: authenticate,
    logout: logout,
    verifyAccess: verifyAccess,
    syncSession: syncSession,
    setSessionConfig: setSessionConfig,
    
    listDirectories: listDirectories,
    listModels: listModels,
    getModels: getModels,
    computeTransformationMatrix: computeTransformationMatrix,
    computeElectrodePlacement: computeElectrodePlacement,

    getData: getData,
    query: query
  };

})();
