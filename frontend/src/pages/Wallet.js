import React from 'react';
import { Container, Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import AddMoney from '../components/Wallet/AddMoney';
import PaymentHistory from '../components/Wallet/PaymentHistory';

const Wallet = () => {
    const [activeTab, setActiveTab] = React.useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    My Wallet
                </Typography>
                
                <Paper sx={{ width: '100%', mb: 4 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                    >
                        <Tab label="Add Money" />
                        <Tab label="Payment History" />
                    </Tabs>
                </Paper>

                <Box sx={{ mt: 3 }}>
                    {activeTab === 0 && <AddMoney />}
                    {activeTab === 1 && <PaymentHistory />}
                </Box>
            </Box>
        </Container>
    );
};

export default Wallet; 