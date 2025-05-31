import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Avatar, Box, Typography, IconButton, Menu, MenuItem, TextField, InputAdornment, CircularProgress, Tabs, Tab } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import './App.css';
import AstronomyEventDialog from './AstronomyEventDialog';
import { fetchTopSpaceNews } from '../utils/geminiApi';

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
            justifyContent: 'flex-start',
            py: 4,
            px: 2,
          }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(10, 12, 18, 0.95)',
                borderRadius: 5,
                boxShadow: '0 4px 32px 0 rgba(16, 21, 28, 0.45)',
                p: 2,
                border: '1px solid #222',
                maxWidth: 600,
                width: '100%',
                animation: 'fadeInScale 1.5s ease-out',
                mb: 4,
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
          </Box>
        )}
        {tab === 1 && (
          <Box sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            py: 4,
            px: 2,
          }}>
            <Box sx={{
              width: '100%',
              maxWidth: 600,
              background: 'rgba(10, 12, 18, 0.92)',
              borderRadius: 5,
              boxShadow: '0 2px 16px 0 rgba(16,21,28,0.25)',
              border: '1px solid #232b3e',
              p: 3,
              mt: 2,
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
                    <Box
                      key={idx}
                      component="li"
                      sx={{
                        mb: 2,
                        p: 2,
                        borderRadius: 3,
                        background: 'rgba(255,255,255,0.03)',
                        boxShadow: '0 1px 6px 0 rgba(110,193,228,0.08)',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        '&:hover': {
                          background: 'rgba(110,193,228,0.10)',
                        },
                      }}
                      onClick={() => setSelectedNews(item)}
                    >
                      <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, fontSize: 18 }}>
                        {item.headline}
                      </Typography>
                    </Box>
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
        )}
        {/* Dialog for date details (always available, but only triggered from Home tab) */}
        <AstronomyEventDialog open={dialogOpen} onClose={handleCloseDialog} date={selectedDate} />
      </Box>
    </>
  );
};

export default HomePage; 