import React, { useState } from 'react';
import { 
  Box, Typography, Button, Card, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination, 
  IconButton, Chip, TextField, Skeleton, Tooltip, InputAdornment, Menu, MenuItem
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  LocalShipping as DispatchIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { 
  useTrips, useCreateTrip, useUpdateTrip, useDispatchTrip, 
  useStartTrip, useCompleteTrip, useCancelTrip 
} from '../features/trips/api/useTrips';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import TripFormDialog from '../features/trips/components/TripFormDialog';
import TripCompleteDialog from '../features/trips/components/TripCompleteDialog';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';

export default function Trips() {
  const { user } = useAuth();
  
  // RBAC checks
  const canAction = ['Admin', 'Fleet Manager', 'Dispatcher'].includes(user?.role?.name);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuTrip, setMenuTrip] = useState(null);

  // Queries
  const { data, isLoading } = useTrips({ 
    page: page + 1, 
    limit: rowsPerPage, 
    search: debouncedSearch 
  });

  // Mutations
  const createMutation = useCreateTrip();
  const updateMutation = useUpdateTrip();
  const dispatchMutation = useDispatchTrip();
  const startMutation = useStartTrip();
  const completeMutation = useCompleteTrip();
  const cancelMutation = useCancelTrip();

  const handleOpenMenu = (event, trip) => {
    setAnchorEl(event.currentTarget);
    setMenuTrip(trip);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuTrip(null);
  };

  const handleOpenForm = (trip = null) => {
    setSelectedTrip(trip);
    setFormOpen(true);
    handleCloseMenu();
  };

  const handleCloseForm = () => {
    setSelectedTrip(null);
    setFormOpen(false);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedTrip) {
        await updateMutation.mutateAsync({ id: selectedTrip.id, data: formData });
        toast.success('Trip updated successfully');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Trip created successfully');
      }
      handleCloseForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save trip');
    }
  };

  const handleDispatch = async () => {
    try {
      await dispatchMutation.mutateAsync(menuTrip.id);
      toast.success('Trip dispatched successfully');
      handleCloseMenu();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to dispatch trip');
    }
  };

  const handleStart = async () => {
    try {
      await startMutation.mutateAsync(menuTrip.id);
      toast.success('Trip started');
      handleCloseMenu();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start trip');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(menuTrip.id);
      toast.success('Trip cancelled');
      handleCloseMenu();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel trip');
    }
  };

  const handleOpenComplete = () => {
    setSelectedTrip(menuTrip);
    setCompleteOpen(true);
    handleCloseMenu();
  };

  const handleCompleteSubmit = async (formData) => {
    try {
      await completeMutation.mutateAsync({ id: selectedTrip.id, actualDistance: formData.actualDistance });
      toast.success('Trip marked as completed');
      setCompleteOpen(false);
      setSelectedTrip(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete trip');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'DISPATCHED': return 'info';
      case 'STARTED': return 'primary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Trips</Typography>
        {canAction && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Create Trip
          </Button>
        )}
      </Box>

      <Card>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            size="small"
            placeholder="Search trips..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Route</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from(new Array(rowsPerPage)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton animation="wave" /></TableCell>
                    <TableCell><Skeleton animation="wave" /></TableCell>
                    <TableCell><Skeleton animation="wave" /></TableCell>
                    <TableCell><Skeleton animation="wave" /></TableCell>
                    <TableCell><Skeleton animation="wave" /></TableCell>
                    <TableCell><Skeleton animation="wave" /></TableCell>
                  </TableRow>
                ))
              ) : data?.data?.trips?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No trips found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data?.trips?.map((trip) => (
                  <TableRow key={trip.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {trip.source} → {trip.destination}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {trip.plannedDistance} km planned
                      </Typography>
                    </TableCell>
                    <TableCell>{trip.vehicle?.registrationNumber || 'N/A'}</TableCell>
                    <TableCell>
                      {trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {dayjs(trip.plannedStartTime).format('MMM DD, HH:mm')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        to {dayjs(trip.plannedEndTime).format('MMM DD, HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={trip.status} 
                        color={getStatusColor(trip.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      {canAction && (
                        <IconButton onClick={(e) => handleOpenMenu(e, trip)} size="small">
                          <MoreVertIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={data?.meta?.total || 0}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        {menuTrip?.status === 'DRAFT' && [
          <MenuItem key="edit" onClick={() => handleOpenForm(menuTrip)}>
            <EditIcon sx={{ mr: 1, fontSize: 20 }} /> Edit Draft
          </MenuItem>,
          <MenuItem key="dispatch" onClick={handleDispatch}>
            <DispatchIcon sx={{ mr: 1, fontSize: 20 }} color="info" /> Dispatch
          </MenuItem>
        ]}
        {menuTrip?.status === 'DISPATCHED' && (
          <MenuItem onClick={handleStart}>
            <StartIcon sx={{ mr: 1, fontSize: 20 }} color="primary" /> Start Trip
          </MenuItem>
        )}
        {menuTrip?.status === 'STARTED' && (
          <MenuItem onClick={handleOpenComplete}>
            <CompleteIcon sx={{ mr: 1, fontSize: 20 }} color="success" /> Complete
          </MenuItem>
        )}
        {['DRAFT', 'DISPATCHED'].includes(menuTrip?.status) && (
          <MenuItem onClick={handleCancel}>
            <CancelIcon sx={{ mr: 1, fontSize: 20 }} color="error" /> Cancel Trip
          </MenuItem>
        )}
        {['COMPLETED', 'CANCELLED'].includes(menuTrip?.status) && (
           <MenuItem disabled>
             No actions available
           </MenuItem>
        )}
      </Menu>

      <TripFormDialog 
        open={formOpen} 
        onClose={handleCloseForm} 
        initialData={selectedTrip} 
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <TripCompleteDialog 
        open={completeOpen} 
        onClose={() => { setCompleteOpen(false); setSelectedTrip(null); }} 
        onSubmit={handleCompleteSubmit}
        isPending={completeMutation.isPending}
      />
    </Box>
  );
}
