import React, { useCallback, useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControl,
  FormControlLabel,
  InputLabel,
  TextField,
} from '@mui/material';

const testShotData = {
  ballSpeed: 98.5,
  spinAxis: -10.2,
  totalSpin: 2350.2,
  hla: 0.0,
  vla: 13.5,
};

const clubData = {
  clubAngleFace: -8.2,
  clubAnglePath: -1.2,
  clubHeadSpeed: 160,
};

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function App() {
  const [logData, setLogData] = useState('');
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
    // testShotData
    setLogData((prev) => prev + `TEST-SHOT: ${JSON.stringify(testShotData)}\n`);
    window.electronAPI.sendTestShot(testShotData, clubData);
  }, []);

  const handlePortChange = useCallback((event) => {
    console.log(event.target.value);
    setPort(event.target.value);
  }, []);

  const handleGarminUpdate = useCallback((_event, status) => {
    console.log('handleGarminUpdate', status);
    setLogData((prev) => prev + `GARMIN: ${JSON.stringify(status)}\n`);
    setGarminState(status);
  }, []);

  const handleGSProUpdate = useCallback((_event, status) => {
    console.log('handleGSProUpdate', status);
    setLogData((prev) => prev + `GSPRO: ${JSON.stringify(status)}\n`);
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
          <Card sx={{ height: '100%' }}>
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
          <Card sx={{ height: '100%' }}>
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
                  <Box align="left">
                    <Typography sx={{ fontSize: 11 }} color="darkgrey">
                      Host IP
                    </Typography>
                    <Typography sx={{ fontSize: 16 }}>
                      <code>{localIp}</code>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item={true}>
                  <TextField
                    variant="standard"
                    label="Port"
                    fullWidth={true}
                    value={port}
                    onChange={handlePortChange}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} item={true}>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>Debug Log</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ fontSize: 12 }} component="div">
                <pre className="debug">{logData}</pre>
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
