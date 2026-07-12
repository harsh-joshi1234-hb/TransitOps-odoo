import React, { useState } from 'react';
import { 
  Box, Typography, Button, TextField, Select, MenuItem, InputAdornment, 
  Card, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MapIcon from '@mui/icons-material/Map';
import BuildIcon from '@mui/icons-material/Build';
import toast from 'react-hot-toast';
import { useVehicles, useDeleteVehicle } from '../features/fleet/api/useVehicles';
import { useDebounce } from '../hooks/useDebounce';
import KpiCard from '../features/dashboard/components/KpiCard';
import VehicleTable from '../features/fleet/components/VehicleTable';
import VehicleFormDialog from '../features/fleet/components/VehicleFormDialog';

export default function Vehicles() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState('');
  
  const [formOpen, setFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  const { data: vehiclesRes, isLoading } = useVehicles({
    status: statusFilter,
    search: debouncedSearch
  });
  
  const deleteMutation = useDeleteVehicle();

  const vehicles = vehiclesRes?.data?.vehicles || [];
  
  // Calculate KPIs locally if API doesn't provide them
  const totalVehicles = vehicles.length;
  const available = vehicles.filter(v => v.status === 'AVAILABLE').length;
  const onTrip = vehicles.filter(v => v.status === 'ON_TRIP').length;
  const inMaintenance = vehicles.filter(v => v.status === 'MAINTENANCE').length;

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormOpen(true);
  };

  const handleDeleteClick = (vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(vehicleToDelete.id);
      toast.success('Vehicle deleted successfully');
      setDeleteOpen(false);
    } catch (err) {
      toast.error('Failed to delete vehicle');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#fff', letterSpacing: '-0.02em' }}>
            Fleet Registry
          </Typography>
          <Typography variant="body2" sx={{ color: '#888', mt: 0.5 }}>
            Enterprise Vehicle Management
          </Typography>
        </Box>
      </Box>

      {/* KPI Section */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, 
        gap: 2.5, 
        mb: 3 
      }}>
        <KpiCard title="Total Vehicles" value={totalVehicles} icon={<DirectionsCarIcon />} color="primary" isLoading={isLoading} />
        <KpiCard title="Available" value={available} icon={<CheckCircleIcon />} color="success" isLoading={isLoading} />
        <KpiCard title="On Trip" value={onTrip} icon={<MapIcon />} color="info" isLoading={isLoading} />
        <KpiCard title="Under Maintenance" value={inMaintenance} icon={<BuildIcon />} color="warning" isLoading={isLoading} />
      </Box>

      {/* Main Content Area */}
      <Card sx={{ backgroundColor: '#16213e', borderRadius: 4, mb: 3 }}>
        {/* Filters */}
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <TextField
            size="small"
            placeholder="Search registration or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#888', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              flexGrow: { xs: 1, sm: 0 },
              minWidth: { xs: '100%', sm: 260 },
              '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 2 }
            }}
          />

          <Select
            size="small"
            displayEmpty
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 2, minWidth: 180, color: statusFilter ? '#fff' : '#888' }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="AVAILABLE">Available</MenuItem>
            <MenuItem value="ON_TRIP">On Trip</MenuItem>
            <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
            <MenuItem value="OUT_OF_SERVICE">Out of Service</MenuItem>
          </Select>

          <Box sx={{ flexGrow: 1 }} />
          
          <Button 
            variant="contained" color="primary" startIcon={<AddIcon />} 
            onClick={() => { setSelectedVehicle(null); setFormOpen(true); }}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, flex: { xs: 1, sm: 'none' } }}
          >
            Add Vehicle
          </Button>
        </Box>

        <VehicleTable vehicles={vehicles} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDeleteClick} />
      </Card>

      <VehicleFormDialog 
        open={formOpen} 
        onClose={() => setFormOpen(false)} 
        vehicle={selectedVehicle} 
      />

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} PaperProps={{ sx: { borderRadius: 3, backgroundColor: '#1E293B', color: '#fff' } }}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#aaa' }}>
            Are you sure you want to delete vehicle {vehicleToDelete?.registrationNumber}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ color: '#888' }}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={deleteMutation.isPending}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
