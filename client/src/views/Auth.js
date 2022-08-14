import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Grid,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActionArea,
  Typography,
  TextField,
} from "@mui/material";

import { useVisualizerContext } from "context";
import { Session } from "sessions/Session";

function Auth() {
  const navigate = useNavigate();
  const [context, dispatch] = useVisualizerContext();
  const { user, server } = context;

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [alert, setAlert] = React.useState(null);

  const authenticate = () => {
    Session.authenticate(username, password).then((result) => {
      if (result) {
        dispatch({type: "user", value: result});
        navigate("/admin/dashboard", { replace: true });
      } else {
        setAlert(
          <Alert variant="filled" severity="error" onClose={() => setAlert(null)}>
            Authenticate Failed
          </Alert>
        );
      }
    })
  }

  const logout = () => {
    Session.logout();
    dispatch({type: "user", value: {}});
  }

  return <>
  <Box style={{height: "calc(100vh - 64px)"}}>
    {alert}
    <Grid 
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justify="center"
      sx={{
        paddingTop: 20
      }}
    >
      <Grid item xs={12} md={6} lg={4}>
        <Card sx={{padding: "30px", background: "#EEEEEE", border: "3px solid"}}>
          {user.username ? <CardContent>
            <Box display={"flex"} justifyContent={"center"}>
              <Typography fontFamily={"Lato"} fontSize={36} fontWeight={500} component={"h5"}>
                {"Authorized as "} {user.username}
              </Typography>
            </Box>
          </CardContent> : <CardContent>
            <Box display={"flex"} justifyContent={"center"}>
              <Typography fontFamily={"Lato"} fontSize={36} fontWeight={500} component={"h5"}>
                {"Enter Authentication Code"}
              </Typography>
            </Box>
            <Box display={"flex"} flexDirection={"column"} justifyContent={"center"}>
              <TextField required type={"text"} label={"Username"} sx={{marginTop: "15px"}} value={username} onChange={(event) => setUsername(event.currentTarget.value)}></TextField>
              <TextField required type={"password"} label={"Password"} sx={{marginTop: "15px"}} value={password} onChange={(event) => setPassword(event.currentTarget.value)}></TextField>
            </Box>
          </CardContent>}
          <Box display={"flex"} justifyContent={"center"}>
            {user.username ? <Button variant={"contained"} color={"info"} fullWidth onClick={() => logout()}>
              <Typography fontFamily={"Lato"} fontSize={20} fontWeight={500} component={"h5"}>
                {"Log Out"}
              </Typography>
            </Button> : <Button variant={"contained"} color={"info"} fullWidth onClick={() => authenticate()}>
              <Typography fontFamily={"Lato"} fontSize={20} fontWeight={500} component={"h5"}>
                {"Authenticate"}
              </Typography>
            </Button>}
          </Box>
        </Card>
      </Grid>
    </Grid>
  </Box>
  </>
}

export default Auth;