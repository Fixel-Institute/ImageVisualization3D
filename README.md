# Image Visualization 3D Tool

## Introduction

The Image Visualization 3D tool is a web-based neural imaging visualization tool developed in React.js with Python Django backend. It utilize WebGL rendering capability from three.js library and offer users the ability to view neural images on any platform with a web browser. 

![Low Resolution Example Gif](https://github.com/Fixel-Institute/ImageVisualization3D/blob/main/demo/ExampleSm.gif)

This tool is an attempt at solving the problem of image sharing among collaborators working on stereotactic neurosurgery together, where the imaging experts may use advance imaging tools like LeadDBS (anatomical atlas) or MRTRIX (probabilistic tractography) to propose a potential targeting location for surgery and they would like to share the proposed location along with atlases and tracts of interest with the clinical teams. However, not all clinical teams has the technical support to load the images of interest, or that the clinicians do not have as much spare time to open up the research PC to look at images during break between surgical cases.

With a web-based application for quick rendering of neural data, clinicians may look at the images on their own spare time and have full control of navigating the 3D spaces for their prefer viewing angles. 

## Examples

### Upload models to server from Authorized Admin account

![Low Resolution Example Gif](https://github.com/Fixel-Institute/ImageVisualization3D/blob/main/demo/Add_Models.gif)

Once a user login with an authorized admin account, they will gain access to the admin dashboard. The dashboard allow user to upload files (.stl, .pts, .edges, and .tck currently supported) to the server. The models uploaded will be immediately reflected on the client side. 

### Create new directory for new patient

![Low Resolution Example Gif](https://github.com/Fixel-Institute/ImageVisualization3D/blob/main/demo/Add_Directory.gif)

It is easy to create a new directory to upload data to. This allow better differentiation for different study participants or clinical cases. 

### Update Target Trajectory

![Low Resolution Example Gif](https://github.com/Fixel-Institute/ImageVisualization3D/blob/main/demo/ExampleSm.gif)

User may manually update the electrode trajectory using Target Points and Entry Points. 

### Viewing of DTI tracts

![Low Resolution Example Gif](https://github.com/Fixel-Institute/ImageVisualization3D/blob/main/demo/ExampleTractSm.gif)

Currently tracts are available in simple line models. The linewidth does not modify in WebGL right now due to [OpenGL limitation](https://threejs.org/docs/#api/en/materials/LineBasicMaterial.linewidth) 

### Viewing of NifTi images

![Low Resolution Example Gif](https://github.com/Fixel-Institute/ImageVisualization3D/blob/main/demo/ExampleNifTiSm.gif)

NifTi has basic support right now. Slice can be dragged after camera is locked (bottom left). See Limitations for why currently this is not supported for upload. 

## Limitations

### 1. Accepted File Type

Currently, only bianry STL is supported for Atlas Models. For tract file, 2 data type is accepted: 1) MRTRIX .tck file and 2) SCIRun Network Points/Edges file. The support for these files are due to internal workflow primarily using these file format, but additional support will be worked on slowly. 

***NOTE:*** NifTi is supported but the web platform does not handle qform and sform properly right now so the Python backend must handle the flipping of dimensions (must be +X, +Y, +Z orientation). Future support for sform/qform will be added in Python backend for simplicity. 

### 2. Orientation Marker

The orientation marker is currently placed in main view scene as a static object and may not be easily viewed like in FreeSurfer or Slicer Software.

### 3. Authorized Access List

As a demo and alpha software, none of the image directory is completely hidden, which means anyone with your server host address can view all images. Future plan is to use add user restriction to ensure only authorized user can view data they have access to. 

### 4. Target with Entry Angle

Currently the platform only support target points and entry points for electrode placement. This is because different targeting tools uses different definition for their entry trajectory (primarily due to how they define their plane for reference). But additional support will be added if people perfer angles + depth combination. 

### 5. Electrode Models (and rotation for segmented lead)

Currently rotation is not supported in segmented lead model. Currently only Medtronic B33015 is supported in electrode model. Additional models will be added in the future. It is not yet clear to me how I can easily implemented cortical strips (ECoG) due to difficulty in deformation over cortical surfaces. 

## Future Plans

The project was started from a simple discussion among researchers at Fixel Institute of University of Florida. An alpha-version is created a few months ago (as shown in this demo) but we have not moved forward in utilizing this tool in actual practices. After months of inactivity, I decide to share this tool to public to see if anyone may find this tool interesting and would like to make suggestion to improve on this tool (and then attract more users during the process). 

It is in my interest to work on limitations listed above if we receive more interest in a tool like this. 
