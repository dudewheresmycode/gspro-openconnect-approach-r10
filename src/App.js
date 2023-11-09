import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  CardHeader,
  FormControl,
  FormControlLabel,
  InputLabel,
  TextField,
  useTheme,
} from '@mui/material';

import GSProIcon from './gspro-icon.svg';
import ApproachR10 from './approach-r10.svg';

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
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    success: {
      main: '#2CBC66',
    },
    error: {
      main: '#E26D5A',
    },
    warning: {
      main: '#F4D35E',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});

function ConnectionStatus({ isConnecting, isConnected }) {
  const fontSize = '2.5rem';
  const theme = useTheme();

  const backgroundColor = useMemo(() => {
    if (isConnected) {
      return theme.palette.success.dark;
    } else if (isConnecting) {
      return theme.palette.info.dark;
    }
    return theme.palette.warning.dark;
  }, [isConnecting, isConnected]);

  const label = useMemo(() => {
    if (isConnected) {
      return 'Connected';
    } else if (isConnecting) {
      return 'Connecting...';
    }
    return 'Disconnected';
  }, [isConnecting, isConnected]);

  const icon = useMemo(() => {
    if (isConnected) {
      return <CheckIcon sx={{ fontSize }} color="success" />;
    } else if (isConnecting) {
      return <CircularProgress size={fontSize} />;
    }
    return <WarningIcon sx={{ fontSize }} color="warning" />;
  }, [isConnecting, isConnected, fontSize]);

  return (
    <CardContent sx={{ backgroundColor, padding: 1 }}>
      <Grid container={true} direction="row" alignItems="center" spacing={2}>
        <Grid item={true}>{icon}</Grid>
        <Grid item={true}>
          <Typography>{label}</Typography>
        </Grid>
      </Grid>
    </CardContent>
  );
}

export default function App() {
  const [port, setPort] = useState(2483);
  const [localIp, setLocalIp] = useState();
  const theme = useTheme();
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
    window.electronAPI.sendTestShot(testShotData, clubData);
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
          <Card sx={{ height: '100%' }}>
            <ConnectionStatus
              isConnected={gsProState.connected}
              isConnecting={gsProState.connecting}
            />
            <CardHeader title="GSPro OpenAPI" align="center" />

            <CardContent align="center">
              <Grid container={true} spacing={3} direction="column">
                <Grid item={true}>
                  <img src={GSProIcon} height="120" />
                </Grid>
                {/* <Grid item={true} flexGrow={0} flexShrink={1} xs={3}>
                  <img src={GSProIcon} width="60" />
                </Grid> */}
                {/* <Grid item={true} xs={true}>
                  <ConnectionStatus
                    isConnected={gsProState.connected}
                    isConnecting={gsProState.connecting}
                  />
                </Grid> */}
                <Grid item={true} xs={true} flexGrow={1} flexShrink={0}>
                  {/* <Typography variant="h5">GSPro OpenAPI</Typography> */}
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
            <ConnectionStatus
              isConnected={garminState.connected}
              isConnecting={garminState.connecting}
            />
            <CardContent align="center">
              <Grid container={true} spacing={3} direction="column">
                <Grid item={true}>
                  <Typography variant="h5">Approach R10</Typography>
                </Grid>
                <Grid item={true}>
                  <img src={ApproachR10} height="120" />
                </Grid>
                {!garminState.connected ? (
                  <Grid item={true}>
                    <Grid container={true} direction="row">
                      <Grid item={true} xs={6}>
                        <Box align="left">
                          <Typography sx={{ fontSize: 14 }} color="darkgrey">
                            This Computer's IP
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 'bold', fontSize: 24 }}
                          >
                            {localIp}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item={true} xs={6}>
                        <Box align="left">
                          <Typography sx={{ fontSize: 14 }} color="darkgrey">
                            Port
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 'bold', fontSize: 24 }}
                          >
                            {port}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                ) : null}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
