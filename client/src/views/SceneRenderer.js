import React, { Suspense } from "react";
import { useParams } from "react-router-dom";
import * as THREE from "three";

import { Canvas, useThree } from '@react-three/fiber'

import { 
  Box,
  Button,
  Drawer,
  Dialog,
  Divider,
  Fab,
  Fade,
  FormControl,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Modal,
  MenuItem,
  Stack,
  Slider,
  IconButton,
  InputLabel,
  Select,
  Typography,
  TextField,
  Icon,
  Popover
} from "@mui/material";

import { BlockPicker } from "react-color";

import SettingIcon from "@mui/icons-material/Settings";
import TimelineIcon from '@mui/icons-material/Timeline';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import OpacityIcon from '@mui/icons-material/Opacity';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LineWeightIcon from '@mui/icons-material/LineWeight';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import NoPhotographyIcon from '@mui/icons-material/NoPhotography';
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';

import { Session } from "sessions/Session.js";
import LoadingProgress from "components/LoadingProgress";
import TransformController from "components/TransformController.js";
import CameraController from "components/CameraController.js";
import Tractography from "components/Tractography.js";
import CoordinateSystem from "components/CoordinateSystem.js";
import ShadowLight from "components/ShadowLight.js";
import VolumetricObject from "components/VolumetricObject.js";
import Model, { parseBinarySTL } from "components/Model.js";
import GLBLoader from "components/GLBLoader.js";
import XRController from "./XRController";

import { useVisualizerContext } from "context";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function SceneRenderer({match}) {
  const ref = React.useRef(null);

  let { directoryId, objectId } = useParams(); 

  const [alert, setAlert] = React.useState(null);
  const [enableVR, setEnableVR] = React.useState(false);
  const [cameraLock, setCameraLock] = React.useState(false);
  const [worldMatrix, setWorldMatrx] = React.useState(null);
  const [drawer, setDrawer] = React.useState({show: false});
  const [directory, setDirectory] = React.useState("");
  const [directoryList, setDirectoryList] = React.useState([]);
  
  const [targetDialog, setTargetDialog] = React.useState({show: false, filename: "", targetPts: [0,0,0], entryPts: [0,0,0]});
  const [addItemModal, setAddItemModal] = React.useState({show: false});
  const [popup, setPopupState] = React.useState({item: ""});
  const [availableItems, setAvailableItems] = React.useState([]);
  const [controlItems, setControlItems] = React.useState([]);

  const [context, dispatch] = useVisualizerContext();
  const { server } = context;

  React.useEffect(() => {
    const matrix = new THREE.Matrix4();
    if (enableVR) {
      matrix.set(1, 0, 0, 0,
                 0, 0, 1, 0,
                 0, -1, 0, 0,
                 0, 0, 0, 100);
      setWorldMatrx(matrix);
    } else {
      matrix.set(1, 0, 0, 0,
                 0, 0, 1, 0,
                 0, -1, 0, 0,
                 0, 0, 0, 1);
      setWorldMatrx(matrix);
      }
  }, [enableVR]);

  React.useEffect(() => {
    Session.listModels({
      "Directory": directory
    }).then((allItems) => {
      setAvailableItems(allItems);
    });

    if (directory == directoryId && objectId) {
      requestModel({filename: objectId, type: 'glb', mode: 'single', data: null})
    }
  }, [directory, objectId]);

  React.useEffect(() => {
    Session.listDirectories().then((allDirectories) => {
      setDirectoryList(allDirectories);
      if (directoryId && allDirectories.includes(directoryId)) setDirectory(directoryId);
      else if (allDirectories.length > 0) setDirectory(allDirectories[0].value);
    });
  }, [server, directoryId]);

  const checkServerObjects = async () => {
    setAddItemModal({...addItemModal, show: true});
  }

  const checkItemIndex = (item) => {
    for (var i in availableItems) {
      if (availableItems[i].filename == item.filename) return i; 
    }
  }

  const requestModel = (item) => {
    if (!item.downloaded) {
      setAlert(<LoadingProgress/>);
      Session.getModels(directory, item).then((data) => {
        if (item.type === "electrode") {
          var electrodeCount = 0;
          for (var i in controlItems) {
            if (controlItems[i].type == "electrode") {
              electrodeCount++;
            }
          }
          data[0].filename += " " + electrodeCount.toString();
          setControlItems([...controlItems, ...data]);
          setAlert(null);
        } else if (item.type === "glb") {
          const loader = new GLTFLoader();
          loader.load(data[0].data, (gltf) => {
            setControlItems([...controlItems, ...gltf.scene.children.map((mesh) => {
              return { filename: mesh.name, type: "glb", downloaded: true, data: mesh, show: true, };
            })]);
            setAlert(null);
          }, (xhr) => {
            setAlert(<LoadingProgress text={"Loaded " + (xhr.loaded/1000000).toFixed(2) + " MB"}/>);
            console.log()
          }, (error) => {
            console.log(error);
          })
        } else {
          const index = checkItemIndex(item);    
          availableItems[index].downloaded = true;
          setAvailableItems(availableItems);
          setControlItems([...controlItems, ...data]);
          setAlert(null);
        }
      }).catch((error) => {
        console.log(error);
        setAlert(null);
      });
    } else {
      for (var i in controlItems) {
        if (controlItems[i].filename == item.filename) {
          controlItems[i].show = !controlItems[i].show;
        }
      }
      setControlItems([...controlItems]);
    }
    setAddItemModal({...addItemModal, show: false});
  }

  const loadData = (item) => {
    requestModel(item);
  }

  const updateOpacity = (filename, event) => {
    for (var i in controlItems) {
      if (controlItems[i].filename == filename) {
        controlItems[i].opacity = event.target.value;
      }
    }
    setControlItems([...controlItems]);
  }

  const updateLineWidth = (filename, event) => {
    for (var i in controlItems) {
      if (controlItems[i].filename == filename) {
        controlItems[i].thickness = event.target.value;
      }
    }
    setControlItems([...controlItems]);
  }

  const updateObjectColor = (filename, color) => {
    for (var i in controlItems) {
      if (controlItems[i].filename == filename) {
        controlItems[i].color = color.hex;
        break;
      }
    }
    setControlItems([...controlItems]);
    Session.setSessionConfig(directory, filename, "Color", color.hex);
  }

  const updateTargeting = () => {
    for (var i in targetDialog.targetPts) {
      if (typeof(targetDialog.targetPts[i]) == "string") {
        targetDialog.targetPts[i] = parseFloat(targetDialog.targetPts[i]);
        if (isNaN(targetDialog.entryPts[i])) {
          targetDialog.entryPts[i] = 0;
        }
      }
      if (typeof(targetDialog.entryPts[i]) == "string") {
        targetDialog.entryPts[i] = parseFloat(targetDialog.entryPts[i]);
        if (isNaN(targetDialog.entryPts[i])) {
          targetDialog.entryPts[i] = 0;
        }
      }
    }
    
    const tform = Session.computeElectrodePlacement(targetDialog.targetPts, targetDialog.entryPts);
    for (var i in controlItems) {
      if (controlItems[i].filename == targetDialog.filename) {
        controlItems[i].matrix = tform;
        break;
      }
    }
    setControlItems([...controlItems]);
    setTargetDialog({show: false, filename: "", targetPts: [0,0,0], entryPts: [0,0,0]});
  }

  const setTargetDialogPoitns = (type, index, event) => {
    var currentPts = targetDialog[type];
    currentPts[index] = event.currentTarget.value;
    setTargetDialog({...targetDialog, [type]: currentPts});
  }
  
  return <>
    {alert}
    <Canvas style={{height: "calc(100vh - 64px)"}}>
      <XRController enabled={enableVR} />
      <CameraController cameraLock={cameraLock}/>
      <CoordinateSystem length={50} origin={[300, -300, -150]}/>
      <ShadowLight x={-100} y={-100} z={-100} color={0xffffff} intensity={0.8}/>
      <ShadowLight x={100} y={100} z={100} color={0xffffff} intensity={0.8}/>
      <hemisphereLight args={[0xffffff, 0xffffff, 0.8]} color={0x3385ff} groundColor={0xffc880} position={[0, 100, 0]} />
      <hemisphereLight args={[0xffffff, 0xffffff, 0.8]} color={0x3385ff} groundColor={0xffc880} position={[0, -100, 0]} />
      {controlItems.map((item) => {
        if (item.data && item.show) {
          if (item.type === "glb") {
            return <primitive key={item.filename} object={item.data} scale={enableVR ? 0.01 : 1} />
          }
        }
      })}

      <group matrixAutoUpdate={false} matrix={worldMatrix}>
        {controlItems.map((item) => {
          if (item.data && item.show) {
            if (item.type === "stl") {
              return <Model key={item.filename} geometry={item.data} material={{
                color: item.color,
                specular: 0x111111,
                shininess: 200,
                opacity: item.opacity
              }} matrix={item.matrix}></Model>
            } else if (item.type == "glb") {
              
            } else if (item.type === "electrode") {
              return <group key={item.filename}>
                {item.data.map((value, index) => {
                  return <Model key={item.subname[index]} geometry={value} material={{
                    color: item.subname[index].endsWith("_shaft.stl") ? item.color : "#FFFFFF",
                    specular: 0x111111,
                    shininess: 200,
                    opacity: item.opacity
                  }} matrix={item.matrix}></Model>
                })}
              </group>
            } else if (item.type === "points") {
              return item.data.map((arrayPoints, index) => {
                return <Tractography key={item.filename + index} pointArray={arrayPoints} color={item.color} linewidth={item.thickness} matrix={item.matrix}/>
              })
            } else if (item.type === "tracts") {
              return item.data.map((arrayPoints, index) => {
                return <Tractography key={item.filename + index} pointArray={arrayPoints} color={item.color} linewidth={item.thickness} matrix={item.matrix}/>
              })
            } else if (item.type === "volume") {
              return <VolumetricObject key={item.filename} data={item.data} matrix={worldMatrix} cameraLock={cameraLock} />
            }
          }
        })}
      </group>
    </Canvas>
  
    <Modal 
      open={addItemModal.show}
      onClose={() => setAddItemModal({...addItemModal, show: false})}
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        maxHeight: 600,
        overflow: "auto",
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      }}>
        <Typography variant="h6" component="h2">
          Add Objects or Tracts
        </Typography>
        <Box>
          <List>
            {availableItems.map((item) => {
              return <ListItem key={item.filename} disablePadding style={{background: item.show ? "#a2cf6e" : ""}}>
                <ListItemButton onClick={() => loadData(item)}>
                  <ListItemIcon>
                    {item.type === "stl" ? <ViewInArIcon /> : null}
                    {item.type === "points" ? <TimelineIcon /> : null}
                    {item.type === "tracts" ? <TimelineIcon /> : null}
                    {item.type === "electrode" ? <ViewInArIcon /> : null}
                  </ListItemIcon>
                  <ListItemText primary={item.filename} />
                </ListItemButton>
              </ListItem>
            })}
          </List>
        </Box>
      </Box>
    </Modal>

    <Dialog 
      open={targetDialog.show}
      onClose={() => setTargetDialog({...targetDialog, show: false})}
      fullWidth
    >
      <Box sx={{
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      }}>
        <Box>
          <Typography component="h2" fontSize={24} fontWeight={"700"}>
            Edit Target Coordinate
          </Typography>
          <Grid container spacing={3} sx={{paddingTop: 3}}>
            <Grid item xs={12} sm={4}>
              <TextField value={targetDialog.targetPts[0]} onChange={(event) => setTargetDialogPoitns("targetPts", 0, event)} label={"Target LT"}/>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField value={targetDialog.targetPts[1]} onChange={(event) => setTargetDialogPoitns("targetPts", 1, event)} label={"Target AP"}/>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField value={targetDialog.targetPts[2]} onChange={(event) => setTargetDialogPoitns("targetPts", 2, event)} label={"Target AX"}/>
            </Grid>
          </Grid>
        </Box>
        <Box marginTop={3} marginBottom={3}>
          <Typography component="h2" fontSize={24} fontWeight={"700"}>
            Edit Entry Coordinate
          </Typography>
          <Grid container spacing={3} sx={{paddingTop: 3}}>
            <Grid item xs={12} sm={4}>
              <TextField value={targetDialog.entryPts[0]} onChange={(event) => setTargetDialogPoitns("entryPts", 0, event)} label={"Entry LT"}/>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField value={targetDialog.entryPts[1]} onChange={(event) => setTargetDialogPoitns("entryPts", 1, event)} label={"Entry AP"}/>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField value={targetDialog.entryPts[2]} onChange={(event) => setTargetDialogPoitns("entryPts", 2, event)} label={"Entry AX"}/>
            </Grid>
          </Grid>
        </Box>
        <Button variant="contained" fullWidth onClick={() => updateTargeting()}> {"Update Electrode"} </Button>
      </Box>
    </Dialog>
    
    <Box position={"absolute"} display={"flex"} flexDirection={"column"} sx={{left: 20, bottom: 20}}>
      <Fab size="large" color="secondary" onClick={() => setCameraLock(!cameraLock)} sx={{marginBottom: 5}}>
        {cameraLock ? <NoPhotographyIcon/> : <PhotoCameraIcon/>}
      </Fab>
      <Fab size="large" color="secondary" onClick={() => setEnableVR(!enableVR)}>
        {<ThreeDRotationIcon/>}
      </Fab>
    </Box>

    <Box position={"absolute"} sx={{right: 20, bottom: 20}}>
      <Fab size="large" color="primary" onClick={() => setDrawer({...drawer, show: true})}>
        <SettingIcon/>
      </Fab>
      <Drawer
        anchor={"right"}
        open={drawer.show}
        onClose={() => setDrawer({...drawer, show: false})}
      >
        <Box
          sx={{ width: 350 }}
          role="presentation"
        >
          <List>
            <Box key={"FolderSelect"} display="flex" flexDirection={"column"} paddingLeft={2} paddingRight={2} paddingTop={1}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Directories</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={directory}
                  label="Directories"
                  onChange={(event) => setDirectory(event.target.value)}
                >
                  {directoryList.map((folder) => {
                    return <MenuItem key={folder.value} value={folder.value}> {folder.label} </MenuItem>
                  })}
                </Select>
              </FormControl>
            </Box>
            {controlItems.map((item) => (
              <Box key={item.filename} display="flex" flexDirection={"column"} paddingLeft={3} paddingRight={3} paddingTop={2}>
                <Box display="flex" flexDirection={"row"} alignItems={"center"} >
                  <Typography fontSize={18} fontWeight={700} align="left" sx={{textDecoration: item.show ? "" : "line-through"}} onClick={() => loadData(item)} style={{cursor: "pointer", paddingRight: "10px"}}>
                    {item.filename}
                  </Typography>
                  <IconButton style={{padding: 0, borderStyle: "solid", borderColor: "#000000", borderWidth: 3}} onClick={(event) => setPopupState({item: item.filename, anchorEl: event.currentTarget})}>
                    <img style={{background: item.color, padding: 15, borderRadius: "50%"}}/>
                  </IconButton>
                  <Popover 
                    open={popup.item == item.filename}
                    onClose={() => setPopupState({item: "", anchorEl: null})}
                    anchorEl={popup.anchorEl}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'center',
                    }}
                    transformOrigin={{
                      vertical: 'bottom',
                      horizontal: 'center',
                    }}
                  >
                    <BlockPicker color={item.color} onChange={(color) => updateObjectColor(item.filename, color)}/>
                  </Popover>
                </Box>
                {item.type === "stl" ? (
                  <Box display="flex" flexDirection={"row"} alignItems={"center"}>
                    <Icon style={{marginRight: 15}}>
                      <OpacityIcon />
                    </Icon>
                    <Slider value={item.opacity} step={0.05} min={0} max={1} onChange={(event) => updateOpacity(item.filename, event)}></Slider>
                  </Box>
                ) : null}
                {item.type === "electrode" ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box display="flex" flexDirection={"row"} alignItems={"center"}>
                        <Icon style={{marginRight: 15}}>
                          <OpacityIcon />
                        </Icon>
                        <Slider value={item.opacity} step={0.05} min={0} max={1} onChange={(event) => updateOpacity(item.filename, event)}></Slider>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box display="flex" flexDirection={"row"} alignItems={"center"} paddingLeft={1} paddingTop={1}>
                        <Button variant="contained" fullWidth onClick={() => setTargetDialog({...targetDialog, filename: item.filename, targetPts: item.targetPts, entryPts: item.entryPts, show: true})}>
                          {"Update Targeting"}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                ) : null}
                {item.type === "points" ? (
                  <Box display="flex" flexDirection={"row"} alignItems={"center"} paddingLeft={1} paddingTop={1}>
                  </Box>
                ) : null}
                {item.type === "tracts" ? (
                  <Box display="flex" flexDirection={"row"} alignItems={"center"} paddingLeft={1} paddingTop={1}>
                    <Icon style={{marginRight: 15}}>
                      <LineWeightIcon />
                    </Icon>
                    <Slider value={item.thickness} step={1} min={1} max={5} onChange={(event) => updateLineWidth(item.filename, event)}></Slider>
                  </Box>
                ) : null}
                <Divider sx={{paddingTop: 1}}/>
              </Box>
            ))}
            <ListItem key={"AddItem"} disablePadding style={{marginTop: 15}} >
              <Button variant={"contained"} color={"info"} style={{width: "100%", marginLeft: 15, marginRight: 15}} onClick={() => checkServerObjects()}>
                <AddCircleIcon/>
              </Button>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  </>
}

export default SceneRenderer;