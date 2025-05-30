import React, { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import { supabase } from './supabaseClient';
import HomePage from './HomePage';

const features = [
  {
    icon: <BoltOutlinedIcon sx={{ color: '#6ec1e4', fontSize: 24 }} />,
    title: 'Travel Through Time & Space',
    desc: `Browse any date to uncover the skies' secrets—past, present, and future—all beautifully presented with real-time data and animations.`,
  },
  {
    icon: <StarBorderOutlinedIcon sx={{ color: '#6ec1e4', fontSize: 24 }} />,
    title: 'Stay in Sync with the Stars',
    desc: `Discover upcoming meteor showers, eclipses, and historical astronomical events tailored to your location using cutting-edge APIs.`,
  },
  {
    icon: <ThumbUpAltOutlinedIcon sx={{ color: '#6ec1e4', fontSize: 24 }} />,
    title: 'Astronomy at Your Fingertips',
    desc: `Get personalized celestial insights—sunrise, sunset, moon phases, and more—based on your exact location and selected date.`,
  },
];

const FeaturesColumn = () => (
  <Box maxWidth={420} height="100%" display="flex" flexDirection="column" justifyContent="center">
    <Box display="flex" alignItems="center" mb={4}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6ec1e4 0%, #143d81 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 1.5,
        }}
      >
        <StarBorderOutlinedIcon sx={{ color: '#fff', fontSize: 20 }} />
      </Box>
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ color: '#6ec1e4', letterSpacing: '0.04em', fontSize: 22 }}
      >
        - KEY FEATURES
      </Typography>
    </Box>
    {features.map((f, i) => (
      <Box key={i} display="flex" alignItems="flex-start" mb={3}>
        <Box mt={0.5} mr={2}>{f.icon}</Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={500} sx={{ color: '#fff', fontSize: 17 }}>
            {f.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>
            {f.desc}
          </Typography>
        </Box>
      </Box>
    ))}
  </Box>
);

const handleGoogleAuth = async () => {
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  if (error) alert(error.message);
};

const LoginScreen: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  return (
    <Box
      minHeight="100vh"
      minWidth="100vw"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background:
          'radial-gradient(ellipse at 60% 40%, #1a263b 0%, #10151c 80%, #0b1018 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Grid container sx={{ height: '100vh', width: '100vw' }}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-end',
            pr: 8,
            pl: 4,
            background: 'transparent',
            height: '100vh',
          }}
        >
          <FeaturesColumn />
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            height: '100vh',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 5 },
              minWidth: { xs: '90vw', sm: 400 },
              maxWidth: 420,
              borderRadius: 3,
              background: 'rgba(18, 24, 36, 0.98)',
              boxShadow: '0 4px 32px 0 rgba(16, 21, 28, 0.45)',
              border: '1px solid #232b3e',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="h5"
              fontWeight={700}
              mb={3}
              textAlign="left"
              sx={{ color: '#fff', letterSpacing: '0.01em', fontSize: 28 }}
            >
              Sign in
            </Typography>
            <Box component="form" display="flex" flexDirection="column" gap={2} onSubmit={handleSubmit}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                variant="filled"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    borderRadius: 2,
                    background: '#181f2a',
                    color: '#fff',
                    fontSize: 16,
                  },
                }}
                InputLabelProps={{ style: { color: '#b0c4de', fontSize: 15 } }}
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                variant="filled"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    borderRadius: 2,
                    background: '#181f2a',
                    color: '#fff',
                    fontSize: 16,
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                        sx={{ color: '#b0c4de' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ style: { color: '#b0c4de', fontSize: 15 } }}
              />
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={remember}
                      onChange={e => setRemember(e.target.checked)}
                      sx={{ color: '#6ec1e4', p: 0.5 }}
                    />
                  }
                  label={<Typography sx={{ color: '#fff', fontSize: 14 }}>Remember me</Typography>}
                  sx={{ ml: -1 }}
                />
                <Link href="#" underline="hover" sx={{ color: '#b0c4de', fontSize: 14, ml: 1 }}>
                  Forgot your password?
                </Link>
              </Box>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  mt: 1,
                  borderRadius: 2,
                  py: 1.3,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  background: '#e6eaf1',
                  color: '#181f2a',
                  boxShadow: '0 2px 8px 0 rgba(16,21,28,0.10)',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#6ec1e4',
                    color: '#fff',
                    boxShadow: '0 4px 14px 0 rgba(110,193,228,0.6)',
                  },
                }}
              >
                Sign in
              </Button>
            </Box>
            <Divider sx={{ my: 3, borderColor: '#2b364c' }}>or</Divider>
            <Button
              variant="outlined"
              startIcon={<GoogleIcon />}
              sx={{
                py: 1.4,
                borderRadius: 2,
                color: '#6ec1e4',
                borderColor: '#6ec1e4',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#a9d4ff',
                  backgroundColor: 'rgba(110,193,228,0.08)',
                },
              }}
              onClick={handleGoogleAuth}
            >
              Sign in with Google
            </Button>
            <Typography
              mt={3}
              textAlign="center"
              fontSize={14}
              color="#b0c4de"
              sx={{ userSelect: 'none' }}
            >
              Don’t have an account?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={onSwitch}
                sx={{
                  color: '#6ec1e4',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Sign up
              </Link>
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const SignUpScreen: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          gender,
        },
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Sign up successful! Please check your email to confirm.');
    }
  };

  return (
    <Box
      minHeight="100vh"
      minWidth="100vw"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background:
          'radial-gradient(ellipse at 60% 40%, #1a263b 0%, #10151c 80%, #0b1018 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Grid container sx={{ height: '100vh', width: '100vw' }}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-end',
            pr: 8,
            pl: 4,
            background: 'transparent',
            height: '100vh',
          }}
        >
          <FeaturesColumn />
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            height: '100vh',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 5 },
              minWidth: { xs: '90vw', sm: 400 },
              maxWidth: 420,
              borderRadius: 3,
              background: 'rgba(18, 24, 36, 0.98)',
              boxShadow: '0 4px 32px 0 rgba(16, 21, 28, 0.45)',
              border: '1px solid #232b3e',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="h5"
              fontWeight={700}
              mb={3}
              textAlign="left"
              sx={{ color: '#fff', letterSpacing: '0.01em', fontSize: 28 }}
            >
              Sign up
            </Typography>
            <Box component="form" display="flex" flexDirection="column" gap={2} onSubmit={handleSubmit}>
              <TextField
                label="Name"
                type="text"
                fullWidth
                required
                variant="filled"
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    borderRadius: 2,
                    background: '#181f2a',
                    color: '#fff',
                    fontSize: 16,
                  },
                }}
                InputLabelProps={{ style: { color: '#b0c4de', fontSize: 15 } }}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                variant="filled"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    borderRadius: 2,
                    background: '#181f2a',
                    color: '#fff',
                    fontSize: 16,
                  },
                }}
                InputLabelProps={{ style: { color: '#b0c4de', fontSize: 15 } }}
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                variant="filled"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    borderRadius: 2,
                    background: '#181f2a',
                    color: '#fff',
                    fontSize: 16,
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                        sx={{ color: '#b0c4de' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ style: { color: '#b0c4de', fontSize: 15 } }}
              />
              <TextField
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                fullWidth
                required
                variant="filled"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    borderRadius: 2,
                    background: '#181f2a',
                    color: '#fff',
                    fontSize: 16,
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                        sx={{ color: '#b0c4de' }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ style: { color: '#b0c4de', fontSize: 15 } }}
              />
              <FormControl fullWidth variant="filled" sx={{ background: '#181f2a', borderRadius: 2 }}>
                <InputLabel sx={{ color: '#b0c4de' }}>Gender</InputLabel>
                <Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  label="Gender"
                  sx={{
                    color: '#fff',
                    '& .MuiSelect-icon': { color: '#b0c4de' },
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  mt: 1,
                  borderRadius: 2,
                  py: 1.3,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  background: '#6ec1e4',
                  color: '#fff',
                  boxShadow: '0 2px 8px 0 rgba(110,193,228,0.5)',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#5cb0de',
                    boxShadow: '0 4px 14px 0 rgba(110,193,228,0.7)',
                  },
                }}
              >
                Create Account
              </Button>
            </Box>
            <Typography
              mt={3}
              textAlign="center"
              fontSize={14}
              color="#b0c4de"
              sx={{ userSelect: 'none' }}
            >
              Already have an account?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={onSwitch}
                sx={{
                  color: '#6ec1e4',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

function App() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get current session
    const currentSession = supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  if (session) {
    return <HomePage session={session} handleLogout={handleLogout} />;
  }

  return isSignUp ? (
    <SignUpScreen onSwitch={() => setIsSignUp(false)} />
  ) : (
    <LoginScreen onSwitch={() => setIsSignUp(true)} />
  );
}

export default App;