import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Grid } from '@mui/material';
import API from '../services/api';

const Machines = () => {
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const { data } = await API.get('/machines');
        setMachines(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMachines();
  }, []);

  const handleBookSlot = async () => {
    try {
      await API.post('/bookings', {
        machineId: selectedMachine,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });
      alert('Booking successful!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Available Machines</Typography>
      <Grid container spacing={3}>
        {machines.map((machine) => (
          <Grid item xs={12} md={6} key={machine._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{machine.name}</Typography>
                <Typography>Status: {machine.status}</Typography>
                <Typography>Capacity: {machine.capacity}</Typography>
                <Button 
                  variant="contained" 
                  onClick={() => setSelectedMachine(machine._id)}
                  sx={{ mt: 2 }}
                >
                  View Slots
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Machines;