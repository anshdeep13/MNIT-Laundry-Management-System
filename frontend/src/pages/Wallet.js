import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  useTheme, 
  alpha, 
  Badge,
  Avatar,
  Card,
  Grid
} from '@mui/material';
import { 
  AccountBalanceWallet as WalletIcon, 
  Add as AddIcon, 
  History as HistoryIcon 
} from '@mui/icons-material';
import AddMoney from '../components/Wallet/AddMoney';
import PaymentHistory from '../components/Wallet/PaymentHistory';
import { useAuth } from '../context/AuthContext';

const Wallet = () => {
    const [activeTab, setActiveTab] = useState(0);
    const theme = useTheme();
    const { user } = useAuth();

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Container maxWidth="lg">
            <Box>
                <Paper
                    elevation={0}
                    sx={{
                        mb: 4,
                        overflow: 'hidden',
                        borderRadius: '16px',
                        background: theme.palette.background.headerGradient || 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                    }}
                >
                    <Box
                        sx={{
                            p: 4,
                            color: 'white',
                            position: 'relative',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '150px',
                                height: '150px',
                                opacity: 0.2,
                                transform: 'translate(30%, -30%)',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
                            }}
                        />
                        
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={8}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <WalletIcon sx={{ mr: 1, fontSize: '2rem' }} />
                                    <Typography variant="h4" fontWeight="bold">
                                        My Wallet
                                    </Typography>
                                </Box>
                                
                                <Typography variant="body1" sx={{ maxWidth: '600px', opacity: 0.9, mb: 1 }}>
                                    Manage your wallet balance and track your payment history for laundry services.
                                </Typography>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                                <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                                    <Card 
                                        elevation={4}
                                        sx={{ 
                                            borderRadius: '16px',
                                            bgcolor: 'rgba(255, 255, 255, 0.15)',
                                            backdropFilter: 'blur(10px)',
                                            p: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            minWidth: '180px'
                                        }}
                                    >
                                        <Typography variant="subtitle2" color="rgba(255, 255, 255, 0.8)" gutterBottom>
                                            Current Balance
                                        </Typography>
                                        
                                        <Box sx={{ position: 'relative', mb: 1 }}>
                                            <Avatar
                                                sx={{ 
                                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                                    width: 70,
                                                    height: 70,
                                                    mb: 1
                                                }}
                                            >
                                                <WalletIcon sx={{ fontSize: '2rem', color: 'white' }} />
                                            </Avatar>
                                            
                                            {user?.walletBalance < 50 && (
                                                <Badge 
                                                    color="error" 
                                                    badgeContent="Low" 
                                                    sx={{ 
                                                        '& .MuiBadge-badge': { 
                                                            fontSize: '0.7rem',
                                                            fontWeight: 'bold' 
                                                        } 
                                                    }}
                                                    overlap="circular"
                                                    anchorOrigin={{
                                                        vertical: 'bottom',
                                                        horizontal: 'right',
                                                    }}
                                                />
                                            )}
                                        </Box>
                                        
                                        <Typography 
                                            variant="h4" 
                                            fontWeight="bold" 
                                            sx={{ color: 'white' }}
                                        >
                                            ₹{user?.walletBalance || 0}
                                        </Typography>
                                    </Card>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
                
                <Paper 
                    elevation={0} 
                    sx={{ 
                        width: '100%', 
                        mb: 4, 
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        overflow: 'hidden',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }}
                >
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                        sx={{
                            '& .MuiTabs-indicator': {
                                height: '3px',
                            },
                            '& .MuiTab-root': {
                                fontWeight: 500,
                                fontSize: '0.95rem',
                                py: 2,
                                transition: 'color 0.3s',
                                '&.Mui-selected': {
                                    fontWeight: 700,
                                    color: theme.palette.primary.main,
                                },
                            },
                        }}
                    >
                        <Tab 
                            label="Add Money" 
                            icon={<AddIcon />} 
                            iconPosition="start"
                        />
                        <Tab 
                            label="Payment History" 
                            icon={<HistoryIcon />} 
                            iconPosition="start"
                        />
                    </Tabs>
                </Paper>

                <Box sx={{ mt: 3, mb: 5 }}>
                    {activeTab === 0 && <AddMoney />}
                    {activeTab === 1 && <PaymentHistory />}
                </Box>
            </Box>
        </Container>
    );
};

export default Wallet; 