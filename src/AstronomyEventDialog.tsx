import React, { useEffect, useState, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField, Box, CircularProgress, IconButton, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { fetchAstronomyEvent, chatWithGemini, fetchNasaApod } from '../utils/geminiApi';

interface AstronomyEventDialogProps {
  open: boolean;
  onClose: () => void;
  date: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

const AstronomyEventDialog: React.FC<AstronomyEventDialogProps> = ({ open, onClose, date }) => {
  const [eventInfo, setEventInfo] = useState<string>('');
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [apod, setApod] = useState<{ title: string; explanation: string; url: string } | null>(null);
  const [apodError, setApodError] = useState<string | null>(null);

  useEffect(() => {
    if (open && date) {
      setLoadingEvent(true);
      setEventInfo('');
      setChatHistory([]);
      setApod(null);
      setApodError(null);
      fetchNasaApod(date)
        .then((data) => {
          setApod(data);
          setEventInfo(`${data.title}\n\n${data.explanation}`);
          setChatHistory([{ role: 'model', content: `${data.title}\n\n${data.explanation}` }]);
        })
        .catch(() => {
          setApodError('Could not fetch NASA APOD.');
          fetchAstronomyEvent(date)
            .then(info => {
              setEventInfo(info);
              setChatHistory([{ role: 'model', content: info }]);
            })
            .finally(() => setLoadingEvent(false));
        })
        .finally(() => setLoadingEvent(false));
    }
  }, [open, date]);

  useEffect(() => {
    // Scroll to bottom on new chat
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: input }];
    setChatHistory(newHistory);
    setInput('');
    setChatLoading(true);
    try {
      const reply = await chatWithGemini(newHistory);
      setChatHistory([...newHistory, { role: 'model', content: reply }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(24, 31, 42, 0.98)',
          borderRadius: 4,
          boxShadow: '0 8px 32px 0 #143d81',
          border: '1.5px solid #232b3e',
          p: 0,
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,20,40,0.7)', color: '#fff', borderRadius: '16px 16px 0 0', px: 3, pt: 2, pb: 1 }}>
        Astronomical Event on {date}
        <IconButton onClick={onClose} size="small" sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ background: 'transparent', minHeight: 200, px: 3, pt: 2, pb: 1 }}>
        {apod && apod.url && (
          <Box display="flex" justifyContent="center" mb={2}>
            <img src={apod.url} alt={apod.title} style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 14, boxShadow: '0 2px 16px #0008' }} />
          </Box>
        )}
        {loadingEvent ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper elevation={0} sx={{ background: 'rgba(110,193,228,0.08)', p: 2, mb: 2, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ color: '#6ec1e4', fontWeight: 600 }}>Event:</Typography>
            <Typography variant="body1" sx={{ color: '#fff' }}>{eventInfo}</Typography>
          </Paper>
        )}
        <Box sx={{ borderBottom: '1px solid #2b364c', my: 2 }} />
        <Box sx={{ maxHeight: 220, overflowY: 'auto', mb: 1, background: 'rgba(24,31,42,0.7)', borderRadius: 2, p: 1 }}>
          {chatHistory.map((msg, idx) => (
            <Box key={idx} mb={1} display="flex" flexDirection="column" alignItems={msg.role === 'user' ? 'flex-end' : 'flex-start'}>
              <Box
                sx={{
                  bgcolor: msg.role === 'user' ? '#6ec1e4' : '#232b3e',
                  color: msg.role === 'user' ? '#181f2a' : '#fff',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  maxWidth: '80%',
                  fontSize: 15,
                  boxShadow: msg.role === 'user' ? '0 1px 4px 0 rgba(110,193,228,0.15)' : 'none',
                }}
              >
                {msg.content}
              </Box>
            </Box>
          ))}
          <div ref={chatEndRef} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ background: 'rgba(24,31,42,0.98)', px: 3, pb: 2, pt: 1, borderRadius: '0 0 16px 16px' }}>
        <TextField
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Ask Gemini about this event..."
          fullWidth
          size="small"
          variant="filled"
          sx={{ background: '#fff', borderRadius: 2, color: '#181f2a', input: { color: '#181f2a', fontWeight: 500 }, boxShadow: '0 1px 8px 0 rgba(110,193,228,0.10)' }}
          InputProps={{ disableUnderline: true }}
          disabled={chatLoading}
        />
        <Button onClick={handleSend} disabled={chatLoading || !input.trim()} variant="contained" sx={{ background: '#6ec1e4', color: '#181f2a', fontWeight: 700, ml: 1, px: 3, py: 1.2, fontSize: 16, borderRadius: 2, boxShadow: '0 2px 8px 0 rgba(110,193,228,0.18)', '&:hover': { background: '#4fa3d1' } }}>
          {chatLoading ? <CircularProgress size={22} /> : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AstronomyEventDialog; 