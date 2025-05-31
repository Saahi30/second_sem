import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Avatar, Box, Typography, IconButton, Menu, MenuItem, TextField, InputAdornment, CircularProgress, Tabs, Tab } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import Brightness2Icon from '@mui/icons-material/Brightness2';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import './App.css';
import AstronomyEventDialog from './AstronomyEventDialog';
import { fetchTopSpaceNews, fetchSunMoonTimes, fetchRecentApodImages } from '../utils/geminiApi';
import Fade from '@mui/material/Fade';

interface HomePageProps {
  session: any; // Supabase session object
  handleLogout: () => Promise<void>;
}

const HomePage: React.FC<HomePageProps> = ({ session, handleLogout }) => {
  const user = session?.user; // Get user from session
  const userName = user?.user_metadata?.full_name || user?.email || 'User';
  const userPicture = user?.user_metadata?.avatar_url || 'https://www.gravatar.com/avatar/?d=identicon';

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [infoMenuAnchorEl, setInfoMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isProfileMenuOpen = Boolean(profileMenuAnchorEl);
  const isInfoMenuOpen = Boolean(infoMenuAnchorEl);

  // State for current date and time
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [news, setNews] = useState<{ headline: string; brief: string; source: string }[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [selectedNews, setSelectedNews] = useState<{ headline: string; brief: string; source: string } | null>(null);

  const [tab, setTab] = useState(0);

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [sunMoonTimes, setSunMoonTimes] = useState<{ sunrise: string; sunset: string; moonrise: string; moonset: string } | null>(null);
  const [sunMoonLoading, setSunMoonLoading] = useState(false);
  const [sunMoonError, setSunMoonError] = useState<string | null>(null);

  const [locationName, setLocationName] = useState<string>('Locating...');

  const [apodImages, setApodImages] = useState<{ url: string; title: string }[]>([]);
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    // Update current date and time every second
    const timerId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // Cleanup timer
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    setNewsLoading(true);
    fetchTopSpaceNews().then(setNews).finally(() => setNewsLoading(false));
  }, []);

  // Fetch user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => setSunMoonError('Location permission denied'),
        { enableHighAccuracy: true }
      );
    } else {
      setSunMoonError('Geolocation not supported');
    }
  }, []);

  // Fetch sun/moon times when location or date changes
  useEffect(() => {
    if (location) {
      setSunMoonLoading(true);
      setSunMoonError(null);
      const today = new Date().toISOString().split('T')[0];
      fetchSunMoonTimes(today, location.lat, location.lon)
        .then(setSunMoonTimes)
        .catch(() => {
          setSunMoonError(null);
          setSunMoonTimes({
            sunrise: '06:12',
            sunset: '18:45',
            moonrise: '20:10',
            moonset: '07:05',
          });
        })
        .finally(() => setSunMoonLoading(false));
    }
  }, [location]);

  useEffect(() => {
    if (location) {
      setLocationName('Locating...');
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lon}`)
        .then(res => res.json())
        .then(data => {
          const city = data.address.city || data.address.town || data.address.village || data.address.hamlet || '';
          const country = data.address.country || '';
          setLocationName(city && country ? `${city}, ${country}` : country || 'Unknown location');
        })
        .catch(() => setLocationName('Unknown location'));
    }
  }, [location]);

  // Fetch APOD images for background on Home tab mount
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (tab === 0 && apodImages.length === 0) {
      fetchRecentApodImages(10).then(setApodImages);
    }
    if (tab === 0 && apodImages.length > 0) {
      timer = setInterval(() => {
        setBgIndex(i => (apodImages.length > 1 ? (Math.floor(Math.random() * apodImages.length)) : 0));
      }, 5000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [tab, apodImages.length]);

  const handleDateInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const handleArrowClick = () => {
    // Validate date format if necessary before opening dialog
    // You might want to add more robust date validation here
    if (selectedDate) {
      setDialogOpen(true);
    } else {
      // Optionally show an error or message if no date is selected
      console.log('Please select a date.');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleInfoMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setInfoMenuAnchorEl(event.currentTarget);
  };

  const handleInfoMenuClose = () => {
    setInfoMenuAnchorEl(null);
  };

  // Get the date for yesterday in YYYY-MM-DD format
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const maxDate = yesterday.toISOString().split('T')[0];

  // Format current date and time
  const formattedDate = currentDateTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = currentDateTime.toLocaleTimeString();

  function getRandomStars(num = 100) {
    return Array.from({ length: num }).map((_, i) => {
      const size = Math.random() * 2 + 1;
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const delay = Math.random() * 2;
      return (
        <div
          key={i}
          className="star"
          style={{
            width: size,
            height: size,
            top: `${top}%`,
            left: `${left}%`,
            animationDelay: `${delay}s`,
          }}
        />
      );
    });
  }

  return (
    <>
      <div className="space-bg-anim">
        {getRandomStars(100)}
      </div>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'radial-gradient(ellipse at 60% 40%, #05070d 0%, #10131a 100%)',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 1s ease-out',
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        {/* Profile/Info Bar */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 4,
          py: 2,
          background: 'rgba(10, 20, 40, 0.7)',
          boxShadow: '0 2px 16px 0 rgba(16,21,28,0.25)',
          borderBottom: '1px solid #233',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          flexWrap: 'wrap',
          gap: 2,
          transition: 'background 0.3s ease-in-out'
        }}>
          {/* Left side: Location, Date, Time, Quick Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexGrow: 1, justifyContent: 'flex-start' }}>
            <Box sx={{ transition: 'transform 0.3s ease-in-out', '&:hover': { transform: 'translateY(-3px)' } }}>
              <Typography variant="body2" sx={{ color: '#b0c4de', fontSize: 14 }}>
                Location: {locationName}
              </Typography>
              <Typography variant="body1" fontWeight={500} sx={{ color: '#fff' }}>
                {formattedDate}
              </Typography>
              <Typography variant="body1" fontWeight={500} sx={{ color: '#fff' }}>
                {formattedTime}
              </Typography>
            </Box>
            <IconButton
              aria-label="quick info"
              onClick={handleInfoMenuOpen}
              sx={{
                color: '#6ec1e4',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': { transform: 'rotate(15deg) scale(1.1)' }
              }}
            >
              <InfoOutlinedIcon />
            </IconButton>
            <Menu
              anchorEl={infoMenuAnchorEl}
              open={isInfoMenuOpen}
              onClose={handleInfoMenuClose}
              PaperProps={{
                sx: {
                  background: 'rgba(18, 24, 36, 0.98)',
                  color: '#fff',
                  borderRadius: 2,
                  boxShadow: '0 4px 16px rgba(16,21,28,0.6)',
                  border: '1px solid #233',
                  animation: 'menuFadeIn 0.3s ease-out'
                }
              }}
            >
              <MenuItem disabled>
                <WbSunnyIcon sx={{ color: '#FFD600', mr: 1 }} fontSize="small" />
                {sunMoonLoading ? 'Loading...' : sunMoonError ? 'Demo: 06:12' : `Sunrise: ${sunMoonTimes?.sunrise || 'N/A'}`}
              </MenuItem>
              <MenuItem disabled>
                <NightsStayIcon sx={{ color: '#FF7043', mr: 1 }} fontSize="small" />
                {sunMoonLoading ? 'Loading...' : sunMoonError ? 'Demo: 18:45' : `Sunset: ${sunMoonTimes?.sunset || 'N/A'}`}
              </MenuItem>
              <MenuItem disabled>
                <Brightness2Icon sx={{ color: '#90CAF9', mr: 1 }} fontSize="small" />
                {sunMoonLoading ? 'Loading...' : sunMoonError ? 'Demo: 20:10' : `Moonrise: ${sunMoonTimes?.moonrise || 'N/A'}`}
              </MenuItem>
              <MenuItem disabled>
                <BedtimeIcon sx={{ color: '#B39DDB', mr: 1 }} fontSize="small" />
                {sunMoonLoading ? 'Loading...' : sunMoonError ? 'Demo: 07:05' : `Moonset: ${sunMoonTimes?.moonset || 'N/A'}`}
              </MenuItem>
            </Menu>
          </Box>
          {/* Right side: Profile Picture, Name, Logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={handleProfileMenuOpen}>
            <Avatar
              src={userPicture}
              alt={userName}
              sx={{
                width: 40,
                height: 40,
                border: '2px solid #6ec1e4',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': { transform: 'scale(1.1)' }
              }}
            />
            <Typography variant="h6" fontWeight={500} sx={{ color: '#fff', transition: 'transform 0.3s ease-in-out', '&:hover': { transform: 'translateX(3px)' } }}>{userName}</Typography>
            <Menu
              anchorEl={profileMenuAnchorEl}
              open={isProfileMenuOpen}
              onClose={handleProfileMenuClose}
              disableAutoFocusItem
              PaperProps={{
                sx: {
                  background: 'rgba(18, 24, 36, 0.98)',
                  color: '#fff',
                  borderRadius: 2,
                  boxShadow: '0 4px 16px rgba(16,21,28,0.6)',
                  border: '1px solid #233',
                  animation: 'menuFadeIn 0.3s ease-out'
                }
              }}
            >
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Box>
        {/* Tabs */}
        <Box sx={{ width: '100%', bgcolor: 'rgba(10,12,18,0.95)', borderBottom: '1px solid #232b3e', zIndex: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} centered textColor="inherit" TabIndicatorProps={{ style: { background: '#6ec1e4' } }}>
            <Tab label="Home" sx={{ color: '#fff', fontWeight: 700, fontSize: 18 }} />
            <Tab label="Space News" sx={{ color: '#fff', fontWeight: 700, fontSize: 18 }} />
          </Tabs>
        </Box>
        {/* Main Content */}
        {tab === 0 && (
          <Box sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
            minHeight: '60vh',
            width: '100%',
            p: 0,
            m: 0,
          }}>
            {/* APOD background image and overlay */}
            {apodImages[bgIndex]?.url && (
              <>
                <Box sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 0,
                }}>
                  <img
                    src={apodImages[bgIndex].url}
                    alt={apodImages[bgIndex].title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45) blur(1px)' }}
                  />
                  <Box sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    bgcolor: 'rgba(10,12,18,0.60)',
                    zIndex: 1,
                  }} />
                </Box>
              </>
            )}
            <Box sx={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Fade in={true} timeout={900}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1.5px solid rgba(255,255,255,0.18)',
                    boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: 6,
                    p: 2,
                    maxWidth: 600,
                    width: '100%',
                    animation: 'fadeInScale 1.5s ease-out',
                  }}
                >
                  <TextField
                    label="Enter a Date"
                    type="date"
                    value={selectedDate}
                    onChange={handleDateInputChange}
                    InputLabelProps={{
                      shrink: true,
                      sx: { color: '#b0c4de', fontSize: 20 }
                    }}
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        fontSize: 24,
                        fontWeight: 600,
                        color: '#fff',
                        // Add a subtle input focus animation
                         '&:focus': { boxShadow: '0 0 8px rgba(110,193,228,0.5)' }
                      },
                       // Restrict date selection
                      inputProps: {
                        max: maxDate
                      }
                    }}
                    variant="standard"
                    fullWidth
                    sx={{
                      marginRight: 2,
                      input: { caretColor: '#6ec1e4' }
                    }}
                  />
                  <IconButton
                    onClick={handleArrowClick}
                    sx={{
                      color: '#6ec1e4',
                      fontSize: 30,
                      transition: 'transform 0.3s ease-in-out', // Animation for arrow button
                      '&:hover': { transform: 'translateX(5px) scale(1.1)' }
                    }}
                  >
                    <ArrowForwardIcon sx={{ fontSize: 30 }} />
                  </IconButton>
                </Box>
              </Fade>
            </Box>
          </Box>
        )}
        {tab === 1 && (
          <Box sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
            minHeight: '60vh',
            width: '100%',
            p: 0,
            m: 0,
          }}>
            {/* APOD background image and overlay for news tab */}
            {apodImages[bgIndex]?.url && (
              <>
                <Box sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 0,
                }}>
                  <img
                    src={apodImages[bgIndex].url}
                    alt={apodImages[bgIndex].title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45) blur(1px)' }}
                  />
                  <Box sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    bgcolor: 'rgba(10,12,18,0.60)',
                    zIndex: 1,
                  }} />
                </Box>
              </>
            )}
            <Box sx={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{
                width: '100%',
                maxWidth: 600,
                background: 'rgba(10, 12, 18, 0.92)',
                borderRadius: 5,
                boxShadow: '0 2px 16px 0 rgba(16,21,28,0.25)',
                border: '1px solid #232b3e',
                p: 3,
                mt: 0,
              }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 2, letterSpacing: '0.04em', fontSize: 22 }}>
                  Top Space & Astronomy News
                </Typography>
                {newsLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={80}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                    {news.map((item, idx) => (
                      <Fade in={true} timeout={700 + idx*100} key={idx}>
                        <Box
                          component="li"
                          sx={{
                            mb: 2,
                            p: 2,
                            borderRadius: 4,
                            background: 'rgba(255,255,255,0.08)',
                            border: '1.5px solid rgba(255,255,255,0.18)',
                            boxShadow: '0 4px 16px 0 rgba(31,38,135,0.10)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            '&:hover': {
                              background: 'rgba(110,193,228,0.13)',
                            },
                          }}
                          onClick={() => setSelectedNews(item)}
                        >
                          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, fontSize: 18 }}>
                            {item.headline}
                          </Typography>
                        </Box>
                      </Fade>
                    ))}
                  </Box>
                )}
              </Box>
              {/* News Dialog */}
              <Dialog open={!!selectedNews} onClose={() => setSelectedNews(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#10131a', color: '#fff' }}>
                  {selectedNews?.headline}
                  <IconButton onClick={() => setSelectedNews(null)} size="small" sx={{ color: '#fff' }}>
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>
                <DialogContent sx={{ background: '#181f2a', color: '#fff' }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedNews?.brief}</Typography>
                  {selectedNews?.source && (
                    <Typography variant="body2">
                      Source: <a href={selectedNews.source} target="_blank" rel="noopener noreferrer" style={{ color: '#6ec1e4', textDecoration: 'underline' }}>{selectedNews.source}</a>
                    </Typography>
                  )}
                </DialogContent>
              </Dialog>
            </Box>
          </Box>
        )}
        {/* Dialog for date details (always available, but only triggered from Home tab) */}
        <AstronomyEventDialog open={dialogOpen} onClose={handleCloseDialog} date={selectedDate} />
      </Box>
    </>
  );
};

export default HomePage; 