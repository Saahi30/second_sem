import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Avatar, Box, Typography, IconButton, Menu, MenuItem, TextField, InputAdornment } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import './App.css';

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

  useEffect(() => {
    // Update current date and time every second
    const timerId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // Cleanup timer
    return () => clearInterval(timerId);
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 60% 40%, #0f2027 0%, #2c5364 100%)',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        // Basic fade-in for the whole page
        animation: 'fadeIn 1s ease-out'
      }}
    >
      {/* Header */}
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
        transition: 'background 0.3s ease-in-out' // Animation for header background
      }}>
        {/* Left side: Location, Date, Time, Quick Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexGrow: 1, justifyContent: 'flex-start' }}>
          <Box sx={{ transition: 'transform 0.3s ease-in-out' /* Animation for date/time block */, '&:hover': { transform: 'translateY(-3px)' } }}>
            <Typography variant="body2" sx={{ color: '#b0c4de', fontSize: 14 }}>
              Location: (Placeholder)
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
              transition: 'transform 0.2s ease-in-out', // Animation for info button
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
                animation: 'menuFadeIn 0.3s ease-out' // Animation for menu
              }
            }}
          >
            <MenuItem onClick={handleInfoMenuClose}>Sunrise: (Placeholder)</MenuItem>
            <MenuItem onClick={handleInfoMenuClose}>Sunset: (Placeholder)</MenuItem>
            <MenuItem onClick={handleInfoMenuClose}>Moonrise: (Placeholder)</MenuItem>
            <MenuItem onClick={handleInfoMenuClose}>Moonset: (Placeholder)</MenuItem>
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
              transition: 'transform 0.2s ease-in-out', // Animation for avatar
              '&:hover': { transform: 'scale(1.1)' }
            }}
          />
          <Typography variant="h6" fontWeight={500} sx={{ color: '#fff', transition: 'transform 0.3s ease-in-out', '&:hover': { transform: 'translateX(3px)' } }}>{userName}</Typography>
          <Menu
            anchorEl={profileMenuAnchorEl}
            open={isProfileMenuOpen}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                background: 'rgba(18, 24, 36, 0.98)',
                color: '#fff',
                borderRadius: 2,
                boxShadow: '0 4px 16px rgba(16,21,28,0.6)',
                border: '1px solid #233',
                 animation: 'menuFadeIn 0.3s ease-out' // Animation for menu
              }
            }}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Main Content: Date Input Bar */}
      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
      }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(18, 24, 36, 0.85)',
            borderRadius: 5,
            boxShadow: '0 4px 32px 0 rgba(16, 21, 28, 0.45)',
            p: 2,
            border: '1px solid #233',
            maxWidth: 600,
            width: '100%',
            animation: 'fadeInScale 1.5s ease-out' // Animation for the input bar
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

      {/* Dialog for date details */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #143d81 0%, #6ec1e4 100%)',
          color: '#fff',
          borderRadius: 4,
          boxShadow: '0 8px 32px 0 #143d81',
          minWidth: 300,
          p: 2,
           animation: 'dialogSlideIn 0.4s ease-out' // Animation for dialog
        }
      }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', background: 'rgba(10,20,40,0.7)', borderRadius: '16px 16px 0 0', mx: -2, mt: -2, px: 2, pt: 2, pb: 1 }}>
          <span>Details for {selectedDate || 'Selected Date'}</span>
          <IconButton onClick={handleCloseDialog} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
             Hi {userName},
          </Typography>
          <Typography>
            This is a demo for the date: {selectedDate || 'No date selected'}.
          </Typography>
          {/* Add more details here later */}
        </DialogContent>
      </Dialog>

      {/* Space/Star animations (optional, can be enhanced) */}
      {/* Add your animation elements here, ensure they are positioned absolutely and don't interfere with layout */}
      <div className="space-bg-anim" /> {/* Assuming this class handles background animations */}
    </Box>
  );
};

export default HomePage; 