import React, { useState } from 'react';
import { 
  Box, Typography, Button, Card, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination, 
  IconButton, Chip, TextField, Skeleton, Tooltip, InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Security as SecurityIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { 
  useDrivers, useCreateDriver, useUpdateDriver, 
  useUpdateSafetyScore, useDeleteDriver 
} from '../features/drivers/api/useDrivers';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import DriverFormDialog from '../features/drivers/components/DriverFormDialog';
import DriverScoreDialog from '../features/drivers/components/DriverScoreDialog';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';

export default function Drivers() {
  const { user } = useAuth();
  
  // RBAC checks
  const canWrite = ['Admin', 'Fleet Manager'].includes(user?.role?.name);
  const isSafetyOfficer = user?.role?.name === 'Safety Officer' || user?.role?.name === 'Admin';

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Queries
  const { data, isLoading } = useDrivers({ 
    page: page + 1, 
    limit: rowsPerPage, 
    search: debouncedSearch 
  });

  // Mutations
  const createMutation = useCreateDriver();
  const updateMutation = useUpdateDriver();
  const scoreMutation = useUpdateSafetyScore();
  const deleteMutation = useDeleteDriver();

  const handleOpenForm = (driver = null) => {
    setSelectedDriver(driver);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedDriver(null);
    setFormOpen(false);
  };

  const handleOpenScore = (driver) => {
    setSelectedDriver(driver);
    setScoreOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedDriver) {
        await updateMutation.mutateAsync({ id: selectedDriver.id, data: formData });
        toast.success('Driver updated successfully');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Driver created successfully');
      }
      handleCloseForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save driver');
    }
  };

  const handleScoreSubmit = async (formData) => {
    try {
      await scoreMutation.mutateAsync({ id: selectedDriver.id, safetyScore: formData.safetyScore });
      toast.success('Safety score updated');
      setScoreOpen(false);
      setSelectedDriver(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update score');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Driver deleted');
      } catch (error) {
        toast.error('Failed to delete driver');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'ON_TRIP': return 'info';
      case 'ON_LEAVE': return 'warning';
      case 'SUSPENDED': return 'error';
      default: return 'default';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const isLicenseExpiringSoon = (expiryDate) => {
    const daysUntilExpiry = dayjs(expiryDate).diff(dayjs(), 'day');
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };
  const isLicenseExpired = (expiryDate) => dayjs(expiryDate).isBefore(dayjs());

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Drivers</Typography>
        {canWrite && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Add Driver
          </Button>
        )}
      </Box>

      <Card>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            size="small"
            placeholder="Search drivers..."
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
                <TableCell>Name</TableCell>
                <TableCell>License No.</TableCell>
                <TableCell>License Expiry</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Safety Score</TableCell>
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
              ) : data?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No drivers found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data?.map((driver) => (
                  <TableRow key={driver.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {driver.firstName} {driver.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {driver.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{driver.licenseNumber}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {dayjs(driver.licenseExpiry).format('MMM DD, YYYY')}
                        {(isLicenseExpiringSoon(driver.licenseExpiry) || isLicenseExpired(driver.licenseExpiry)) && (
                          <Tooltip title={isLicenseExpired(driver.licenseExpiry) ? "License Expired" : "Expiring Soon"}>
                            <WarningIcon color="error" fontSize="small" />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={driver.status} 
                        color={getStatusColor(driver.status)} 
                        size="small" 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={driver.safetyScore} 
                        color={getScoreColor(driver.safetyScore)} 
                        size="small" 
                        icon={<SecurityIcon />}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {isSafetyOfficer && (
                        <Tooltip title="Update Safety Score">
                          <IconButton onClick={() => handleOpenScore(driver)} color="warning" size="small">
                            <SecurityIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canWrite && (
                        <>
                          <Tooltip title="Edit Driver">
                            <IconButton onClick={() => handleOpenForm(driver)} color="primary" size="small">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Driver">
                            <IconButton onClick={() => handleDelete(driver.id)} color="error" size="small">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
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

      <DriverFormDialog 
        open={formOpen} 
        onClose={handleCloseForm} 
        initialData={selectedDriver} 
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <DriverScoreDialog 
        open={scoreOpen} 
        onClose={() => { setScoreOpen(false); setSelectedDriver(null); }} 
        currentScore={selectedDriver?.safetyScore}
        onSubmit={handleScoreSubmit}
        isPending={scoreMutation.isPending}
      />
    </Box>
  );
}
