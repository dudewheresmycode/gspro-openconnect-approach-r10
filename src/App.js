import React, { useCallback, useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { TextField } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function App() {
  const [port, setPort] = useState(2483);
  const [localIp, setLocalIp] = useState();
  const [gsProState, setGsProState] = useState({
    connected: false,
    connecting: true,
  });
  const [garminState, setGarminState] = useState({ connected: false });

  const getIp = async () => {
    const ip = await window.electronAPI.getLocalIP();
    console.log(ip);
    setLocalIp(ip);
  };

  const sendTestShot = useCallback((event) => {
    console.log('test shot');
  }, []);

  const handlePortChange = useCallback((event) => {
    console.log(event.target.value);
    setPort(event.target.value);
  }, []);

  const handleGarminUpdate = useCallback((_event, status) => {
    console.log('handleGarminUpdate', status);
    setGarminState(status);
  }, []);

  const handleGSProUpdate = useCallback((_event, status) => {
    console.log('handleGSProUpdate', status);
    setGsProState(status);
  }, []);

  useEffect(() => {
    window.electronAPI.onGarminUpdate(handleGarminUpdate);
    window.electronAPI.onGSProUpdate(handleGSProUpdate);
    window.electronAPI.getStatus();
    getIp();
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Grid container={true} spacing={3} padding={3}>
        <Grid item={true} xs={6}>
          <Card>
            <CardContent align="center">
              <Grid container={true} spacing={3} direction="column">
                <Grid item={true}>
                  <Typography variant="h5">GSPro OpenAPI</Typography>
                </Grid>
                <Grid item={true}>
                  {gsProState.connected ? (
                    <Chip
                      icon={<CheckIcon />}
                      label="Connected"
                      color="success"
                    />
                  ) : gsProState.connecting ? (
                    <Chip
                      icon={<CircularProgress size={'1rem'} />}
                      label="Connecting"
                      color="info"
                    />
                  ) : (
                    <Chip
                      icon={<WarningIcon />}
                      label="Disconnected"
                      color="warning"
                    />
                  )}
                </Grid>
                <Grid item={true}>
                  <Button
                    variant="contained"
                    color="inherit"
                    disabled={!gsProState.connected}
                    onClick={sendTestShot}
                  >
                    Send Test Shot
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item={true} xs={6}>
          <Card>
            <CardContent align="center">
              <Grid container={true} spacing={3} direction="column">
                <Grid item={true}>
                  <Typography variant="h5">Approach R10</Typography>
                </Grid>
                <Grid item={true}>
                  {garminState.connected ? (
                    <Chip
                      icon={<CheckIcon />}
                      label="Connected"
                      color="success"
                    />
                  ) : gsProState.connecting ? (
                    <Chip
                      icon={<CircularProgress size={'1rem'} />}
                      label="Connecting"
                      color="info"
                    />
                  ) : (
                    <Chip
                      icon={<WarningIcon />}
                      label="Disconnected"
                      color="warning"
                    />
                  )}
                </Grid>
                <Grid item={true}>
                  <TextField
                    label="Host IP"
                    value={localIp}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item={true}>
                  <TextField
                    label="Port"
                    value={port}
                    onChange={handlePortChange}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        {/* <Grid xs={12} item={true}>
          <Card>
            <CardContent>Hello</CardContent>
          </Card>
        </Grid> */}
      </Grid>
    </ThemeProvider>
  );
}
