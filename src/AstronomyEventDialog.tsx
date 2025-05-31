import React, { useEffect, useState, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField, Box, CircularProgress, IconButton, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { fetchAstronomyEvent, chatWithGemini } from '../utils/geminiApi';

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

  useEffect(() => {
    if (open && date) {
      setLoadingEvent(true);
      setEventInfo('');
      setChatHistory([]);
      fetchAstronomyEvent(date)
        .then(info => {
          setEventInfo(info);
          setChatHistory([{ role: 'model', content: info }]);
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
    const newHistory = [...chatHistory, { role: 'user', content: input }];
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Astronomical Event on {date}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ background: '#181f2a', minHeight: 200 }}>
        {loadingEvent ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper elevation={0} sx={{ background: 'rgba(110,193,228,0.08)', p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: '#6ec1e4', fontWeight: 600 }}>Event:</Typography>
            <Typography variant="body1" sx={{ color: '#fff' }}>{eventInfo}</Typography>
          </Paper>
        )}
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
      <DialogActions sx={{ background: '#181f2a' }}>
        <TextField
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Ask Gemini about this event..."
          fullWidth
          size="small"
          variant="filled"
          sx={{ background: '#232b3e', borderRadius: 2, color: '#fff' }}
          InputProps={{ disableUnderline: true }}
          disabled={chatLoading}
        />
        <Button onClick={handleSend} disabled={chatLoading || !input.trim()} variant="contained" sx={{ background: '#6ec1e4', color: '#181f2a', fontWeight: 600, ml: 1 }}>
          {chatLoading ? <CircularProgress size={22} /> : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AstronomyEventDialog; 