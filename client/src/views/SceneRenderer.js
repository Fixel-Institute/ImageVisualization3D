import React from "react";
import * as THREE from "three";

import { Canvas, useThree } from '@react-three/fiber'

import { 
  Box,
  Button,
  Drawer,
  Fab,
  Fade,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Modal,
  Stack,
  Slider,
  IconButton,
  Typography,
  Icon,
  Popover
} from "@mui/material";

import { BlockPicker } from "react-color";

import SettingIcon from "@mui/icons-material/Settings";
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import OpacityIcon from '@mui/icons-material/Opacity';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LineWeightIcon from '@mui/icons-material/LineWeight';
import TimelineIcon from '@mui/icons-material/Timeline';

import { Session } from "sessions/Session.js"
import CameraController from "components/CameraController.js";
import Tractography from "components/Tractography.js";
import CoordinateSystem from "components/CoordinateSystem.js";
import ShadowLight from "components/ShadowLight";
import Model, { parseBinarySTL } from "components/Model";

import { useVisualizerContext } from "context";

function SceneRenderer() {
  const ref = React.useRef(null);

  const [drawer, setDrawer] = React.useState({show: false});
  const [addItemModal, setAddItemModal] = React.useState({show: false});
  const [popup, setPopupState] = React.useState({item: ""});
  const [availableItems, setAvailableItems] = React.useState([]);
  const [controlItems, setControlItems] = React.useState([]);

  const [context, dispatch] = useVisualizerContext();
  const { server } = context;

  React.useEffect(() => {
    Session.setServer(server);
    Session.query("/server/listModels", {
      "Directory": "Demo"
    }).then((response) => {
      const allItems = [];
      for (var filename of response.data) {
        allItems.push({
          filename: filename,
          data: null,
        });
      }
      setAvailableItems(allItems);
    });
  }, [server]);

  const checkServerObjects = async () => {
    setAddItemModal({...addItemModal, show: true})
  }

  const requestModel = (item) => {
    if (!item.downloaded) {
      Session.query("/server/getModel", {
        "Directory": "Demo",
        "FileName": item.filename
      }, {responseType: "arraybuffer"}).then((response) => {
        for (var i in availableItems) {
          if (availableItems[i].filename == item.filename) {
            availableItems[i].downloaded = true;
            setControlItems([...controlItems, {
              filename: item.filename,
              downloaded: true,
              data: parseBinarySTL(response.data),
              opacity: 1,
              color: "#FFFFFF",
              show: true,
            }]);
          }
        }
        setAvailableItems(availableItems);
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

  const requestTracts = (item) => {
    if (!item.downloaded) {
      Session.query("/server/getTracts", {
        "Directory": "Demo",
        "FileName": item.filename
      }).then((response) => {
        for (var i in availableItems) {
          if (availableItems[i].filename == item.filename) {
            availableItems[i].downloaded = true;
            setControlItems([...controlItems, {
              filename: item.filename,
              downloaded: true,
              data: response.data.points,
              thickness: 1,
              color: "#FFFFFF",
              show: true,
            }]);
          }
        }
        setAvailableItems(availableItems);
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
    if (item.filename.endsWith(".stl")) {
      requestModel(item);
    } else if (item.filename.endsWith(".pts")) {
      requestTracts(item);
    }
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
      }
    }
    setControlItems([...controlItems]);
  }

  return <>
    <Canvas style={{height: "calc(100vh - 64px)"}}>
      <CameraController/>
      <ShadowLight x={-100} y={-100} z={-100} color={0xffffff} intensity={0.5}/>
      <ShadowLight x={100} y={100} z={100} color={0xffffff} intensity={0.5}/>
      <hemisphereLight args={[0xffffff, 0xffffff, 0.2]} color={0x3385ff} groundColor={0xffc880} position={[0, 50, 0]} />
      <CoordinateSystem length={50} origin={[-50,-50,-50]}/>
      {controlItems.map((item) => {
        if (item.data && item.show) {
          if (item.filename.endsWith(".stl")) {
            return <Model key={item.filename} geometry={item.data} material={{
              color: item.color,
              specular: 0x111111,
              shininess: 200,
              opacity: item.opacity
            }}></Model>
          } else if (item.filename.endsWith(".pts")) {
            return item.data.map((arrayPoints, index) => {
              return <Tractography key={item.filename + index} pointArray={arrayPoints} color={item.color} linewidth={item.thickness}/>
            })
          }
        }
      })}
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
                    {item.filename.endsWith(".stl") ? <ViewInArIcon /> : null}
                    {item.filename.endsWith(".pts") ? <TimelineIcon /> : null}
                  </ListItemIcon>
                  <ListItemText primary={item.filename} />
                </ListItemButton>
              </ListItem>
            })}
          </List>
        </Box>
      </Box>
    </Modal>

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
            {controlItems.map((item) => (
              <Box key={item.filename} display="flex" flexDirection={"column"} paddingLeft={2} paddingRight={2} paddingTop={1}>
                <Box display="flex" flexDirection={"row"} alignItems={"center"} >
                  <IconButton onClick={() => loadData(item)}>
                    {item.filename.endsWith(".stl") ? <ViewInArIcon style={{background: item.show ? "#a2cf6e" : "#ff4569", borderRadius: "50%", padding: 5}} /> : null}
                    {item.filename.endsWith(".pts") ? <TimelineIcon style={{background: item.show ? "#a2cf6e" : "#ff4569", borderRadius: "50%", padding: 5}} /> : null}
                  </IconButton>
                  <Typography fontWeight={700}>
                    {item.filename}
                  </Typography>
                  <IconButton style={{padding: 0, marginLeft: 10, borderStyle: "solid", borderColor: "#000000", borderWidth: 3}} onClick={(event) => setPopupState({item: item.filename, anchorEl: event.currentTarget})}>
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
                {item.filename.endsWith(".stl") ? (
                  <Box display="flex" flexDirection={"row"} alignItems={"center"} paddingLeft={1} paddingTop={1}>
                    <Icon style={{marginRight: 15}}>
                      <OpacityIcon />
                    </Icon>
                    <Slider value={item.opacity} step={0.05} min={0} max={1} onChange={(event) => updateOpacity(item.filename, event)}></Slider>
                  </Box>
                ) : null}
                {item.filename.endsWith(".pts") ? (
                  <Box display="flex" flexDirection={"row"} alignItems={"center"} paddingLeft={1} paddingTop={1}>
                    <Icon style={{marginRight: 15}}>
                      <LineWeightIcon />
                    </Icon>
                    <Slider value={item.thickness} step={1} min={1} max={5} onChange={(event) => updateLineWidth(item.filename, event)}></Slider>
                  </Box>
                ) : null}
              </Box>
            ) )}
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