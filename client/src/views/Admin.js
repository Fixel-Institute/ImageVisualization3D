import React from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Menu,
  MenuItem,
  Typography,
  Toolbar,
  TextField,
  DialogActions
} from "@mui/material";

import { DropzoneArea } from "mui-file-dropzone";

import TimelineIcon from '@mui/icons-material/Timeline';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import AddBoxIcon from '@mui/icons-material/AddBox';

import { Session } from "sessions/Session.js";
import { useVisualizerContext } from "context";

const drawerWidth = "240px";

function Admin({menuOpen, setMenuOpen}) {
  const [context, dispatch] = useVisualizerContext();
  const { server } = context;

  const [alert, setAlert] = React.useState(null);

  const [contextMenu, setContextMenu] = React.useState(null)
  const [directory, setDirectory] = React.useState(null);
  const [directoryList, setDirectoryList] = React.useState([]);
  const [contentList, setContentList] = React.useState([]);

  const [newDirectory, setNewDirectory] = React.useState({name: "", show: false});
  const [dropzoneModal, setDropzoneModal] = React.useState({files: [], show: false});

  React.useEffect(() => {
    Session.listDirectories().then((allDirectories) => {
      setDirectoryList(allDirectories);
    });
  }, [server]);

  const selectFolder = (event, directory) => {
    if (event.type === "click" || !event) {
      setDirectory(directory);
      Session.listModels({
        "Directory": directory
      }).then((allItems) => {
        setContentList(allItems);
      });
    } else if (event.type === "contextmenu") {
      event.preventDefault();
      setContextMenu({
        mouseX: event.clientX + 2,
        mouseY: event.clientY - 6,
        directory: directory
      });
    }
  };

  const fileUploader = () => {
    if (dropzoneModal.files.length > 0) {
      const formData = new FormData();
      formData.append("Directory", directory);
      for (var i in dropzoneModal.files) {
        formData.append("file", dropzoneModal.files[i]);
      }
      Session.query("/server/uploadFiles", formData, {
        "Content-Type": "multipart/form-data"
      }).then((response) => {
        Session.listModels({
          "Directory": directory
        }).then((allItems) => {
          setContentList(allItems);
        });
        setDropzoneModal({...dropzoneModal, show: false});
      });
    } else {
      setDropzoneModal({...dropzoneModal, show: false});
    }
  }

  const fileChanged = (files) => {
    setDropzoneModal({...dropzoneModal, files: files});
  }

  const requestNewFolder = () => {
    const formData = new FormData();
    formData.append("Directory", newDirectory.name);
    formData.append("NewDirectory", true);
    Session.query("/server/uploadFiles", formData, {
      "Content-Type": "multipart/form-data"
    }).then((response) => {
      Session.listDirectories().then((allDirectories) => {
        setDirectoryList(allDirectories);
      });
      setNewDirectory({name: "", show: false});
    });
  }

  const requestDeleteFolder = () => {
    if (contextMenu) {
      Session.query("/server/deleteDirectory", {
        "Directory": contextMenu.directory,
      }).then(() => {
        setDirectoryList(directoryList.filter((value) => value.value != contextMenu.directory));
        setContextMenu(null);
      }).catch(() => {
        setAlert(
          <Alert variant="filled" severity="error" onClose={() => setAlert(null)}>
            Cannot Delete Directory, please verify the directory is empty.
          </Alert>
        );
        setContextMenu(null);
      });
    }
  }

  const requestDeleteFile = (item) => {
    Session.query("/server/deleteFile", {
      "Directory": directory,
      "FileName": item.filename
    }).then(() => {
      setContentList(contentList.filter((value) => value != item));
    });
  }

  return <>
    <Drawer
      variant="persistent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      open={menuOpen}
    >
      <Toolbar/>
      <Box sx={{ overflow: 'auto', paddingTop: 1 }}>
        <List>
          <Box display={"flex"} flexDirection={"row"} alignItems={"center"} sx={{paddingLeft: 1, paddingRight: 1, marginBottom: 2}}>
            <Button variant={"contained"} fullWidth onClick={() => setNewDirectory({...newDirectory, show: true})}>
              <FolderOpenIcon/>
              <Typography fontSize={14} sx={{paddingLeft: 1}}>
                {"New Directory"}
              </Typography>
            </Button>
          </Box>
          {directoryList.map((folder) => {
            return <Box key={folder.value} display={"flex"} flexDirection={"row"} alignItems={"center"} sx={{paddingLeft: 1, paddingRight: 1}}>
              <ListItemButton onClick={(event) => selectFolder(event, folder.value)} onContextMenu={(event) => selectFolder(event, folder.value)}>
                <FolderOpenIcon/>
                <Typography sx={{paddingLeft: 1}}>
                  {folder.value}
                </Typography>
              </ListItemButton>
            </Box>
          })}
          <Menu
            open={contextMenu !== null}
            onClose={() => setContextMenu(null)}
            anchorReference="anchorPosition"
            anchorPosition={
              contextMenu !== null
                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                : undefined
            }
          >
            <MenuItem onClick={() => requestDeleteFolder()}>Delete</MenuItem>
          </Menu>
        </List>
      </Box>
    </Drawer>

    <Dialog open={newDirectory.show} onClose={() => setNewDirectory({...newDirectory, name: "", show: false})}>
      <DialogContent>
        <TextField type="text" label="New Directory Name" value={newDirectory.name} onChange={(event) => setNewDirectory({...newDirectory, name: event.currentTarget.value})} />
      </DialogContent>
      <DialogActions style={{paddingLeft: 20, paddingRight: 20, marginBottom: 15}}>
        <Button variant="contained" fullWidth color={"error"} onClick={() => setNewDirectory({...newDirectory, name: "", show: false})}>
          <Typography fontSize={15} fontWeight={700}>
            {"Cancel"}
          </Typography>
        </Button>
        <Button variant="contained" fullWidth onClick={() => requestNewFolder()}>
          <Typography fontSize={15} fontWeight={700}>
            {"Create"}
          </Typography>
        </Button>
      </DialogActions>
    </Dialog>

    <Dialog open={dropzoneModal.show} onClose={() => setDropzoneModal({...dropzoneModal, show: false})}>
      <DialogTitle>File Uploader</DialogTitle>
      <DialogContent>
        <DropzoneArea 
          dropzoneText={"Drag and Drop Files Here Or Click to Select"} 
          dropzoneClass={"dropzone"}
          acceptedFiles={[".stl", ".pts", ".edge", ".tck"]}
          onChange={fileChanged} 
          useChipsForPreview={true}
          maxFileSize={100000000}
          filesLimit={10} 
        />
      </DialogContent>
      <DialogActions style={{paddingRight: 20, marginBottom: 15}}>
        <Button variant="contained" color={"error"} onClick={() => setDropzoneModal({...dropzoneModal, show: false})}>
          <Typography fontSize={15} fontWeight={700}>
            {"Cancel"}
          </Typography>
        </Button>
        <Button variant="contained" onClick={() => fileUploader()}>
          <Typography fontSize={15} fontWeight={700}>
            {"Upload"}
          </Typography>
        </Button>
      </DialogActions>
    </Dialog>

    <Box sx={{minHeight: "calc(100vh - 84px)", maxWidth: "calc(100vw - drawerWidthpx)", marginLeft: menuOpen ? drawerWidth : "0px"}}>
      {alert}
      <Grid container spacing={4} alignItems={"stretch"} sx={{paddingLeft: 3, paddingRight: 3, marginTop: 1}}>
        {contentList.map((content) => {
          return <Grid key={content.filename} item sm={6} md={4} lg={3} xl={2}>
            <Card sx={{border: "2px solid", height: "100%"}}>
              <CardContent style={{paddingBottom: "3px"}}>
                <Typography fontWeight={700} fontSize={18} align="center">
                  {content.type.toUpperCase()}
                </Typography>
                <Typography align="center" fontSize={14} style={{wordWrap: "break-word"}}>
                  {content.filename}
                </Typography>
                <Divider style={{marginTop: 5}}/>
                <Box display={"flex"} flexDirection={"row"} justifyContent={"space-around"}>
                  <IconButton>
                    <EditIcon color="info"/>
                  </IconButton>
                  <IconButton onClick={() => requestDeleteFile(content)}>
                    <DeleteForeverIcon color="error"/>
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        })}

        {directory ? (
          <Grid item sm={6} md={4} lg={3} xl={2}>
            <Box style={{height: "100%"}}>
              <Button color={"secondary"} fullWidth variant={"outlined"} style={{height: "100%"}} onClick={() => setDropzoneModal({...dropzoneModal, show: true})}>
                <AddBoxIcon/>
              </Button>
            </Box>
          </Grid>
        ) : null}
      </Grid>
    </Box>
  </>
}

export default Admin;