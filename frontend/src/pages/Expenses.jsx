import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Box, Typography, Button, TextField, Select, MenuItem, InputAdornment, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Card, CardContent, Tabs, Tab, Chip, IconButton, Skeleton, OutlinedInput,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import PaidIcon from '@mui/icons-material/Paid';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useExpenses, useExpenseKPIs, useCreateExpense, useTransitionExpense, useFuelLogs, useCreateFuel } from '../features/expenses/api/useExpenses';
import { useVehicles } from '../features/fleet/api/useVehicles';
import { useDebounce } from '../hooks/useDebounce';
import KpiCard from '../features/dashboard/components/KpiCard';

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'default' },
  SUBMITTED: { label: 'Submitted', color: 'warning' },
  APPROVED: { label: 'Approved', color: 'info' },
  PENDING_PAYMENT: { label: 'Pending Payment', color: 'secondary' },
  PROCESSING_PAYMENT: { label: 'Processing Payment', color: 'primary' },
  PAID: { label: 'Paid', color: 'success' },
  REJECTED: { label: 'Rejected', color: 'error' },
};

export default function Expenses() {
  const [tabValue, setTabValue] = useState(1); // 0: Fuel, 1: Expenses
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data: expensesRes, isLoading: loadingExpenses } = useExpenses({ 
    status: statusFilter, 
    type: typeFilter,
    search: debouncedSearch 
  });
  
  const { data: fuelLogsRes, isLoading: loadingFuel } = useFuelLogs({
    search: debouncedSearch
  });

  const { data: kpisRes, isLoading: loadingKpis } = useExpenseKPIs();

  const expenses = expensesRes?.data?.expenses || [];
  const fuelLogs = fuelLogsRes?.data?.fuelLogs || fuelLogsRes?.data?.items || (Array.isArray(fuelLogsRes?.data) ? fuelLogsRes?.data : []);
  const kpis = kpisRes?.data || null;

  const { data: vehiclesRes } = useVehicles({});
  const vehicles = vehiclesRes?.data?.vehicles || vehiclesRes?.data || (Array.isArray(vehiclesRes?.data) ? vehiclesRes?.data : []);

  // Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);

  const [formData, setFormData] = useState({
    type: 'FUEL',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    vendor: '',
    receiptNumber: '',
    description: '',
    vehicleId: '',
  });

  const [fuelData, setFuelData] = useState({
    fuelType: 'DIESEL',
    paymentMethod: 'CASH',
    liters: '',
    pricePerLiter: '',
    odometer: '',
    filledAt: new Date().toISOString().slice(0, 10),
    vehicleId: '',
  });

  const createMutation = useCreateExpense();
  const createFuelMutation = useCreateFuel();

  const handleCreateFuel = async (e) => {
    e.preventDefault();
    try {
      await createFuelMutation.mutateAsync({
        ...fuelData,
        liters: parseFloat(fuelData.liters),
        pricePerLiter: parseFloat(fuelData.pricePerLiter),
        odometer: parseInt(fuelData.odometer),
        filledAt: new Date(fuelData.filledAt).toISOString(),
      });
      toast.success('Fuel log created successfully!');
      setShowFuelModal(false);
      setFuelData({
        fuelType: 'DIESEL', paymentMethod: 'CASH', liters: '', pricePerLiter: '', odometer: '', filledAt: new Date().toISOString().slice(0, 10), vehicleId: ''
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create fuel log.');
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString()
      });
      toast.success('Expense claim created successfully!');
      setShowCreateModal(false);
      setFormData({
        type: 'FUEL', amount: '', date: new Date().toISOString().slice(0, 10),
        vendor: '', receiptNumber: '', description: '', vehicleId: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create expense claim.');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredExpenses = expenses.filter((e) =>
    e.expenseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.vendor?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#fff', letterSpacing: '-0.02em' }}>
            Fuel & Expense Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#888', mt: 0.5 }}>
            Enterprise Expense Management • Multi-Level Lifecycle
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
        <KpiCard 
          title="Total Fuel Cost" 
          value="$0.00" 
          icon={<LocalGasStationIcon />} 
          color="warning"
          trend="+0%"
          isLoading={loadingKpis}
        />
        <KpiCard 
          title="Total Expense" 
          value={kpis ? `$${(kpis.pendingApproval.amount + kpis.approvedExpenses.amount + kpis.paidExpenses.amount).toLocaleString()}` : '$0.00'} 
          icon={<ReceiptIcon />} 
          color="primary"
          trend="+3%"
          isLoading={loadingKpis}
        />
        <KpiCard 
          title="Pending Approvals" 
          value={kpis ? `$${kpis.pendingApproval.amount.toLocaleString()}` : '$0.00'} 
          icon={<PendingIcon />} 
          color="secondary"
          isLoading={loadingKpis}
        />
        <KpiCard 
          title="Approved Expenses" 
          value={kpis ? `$${kpis.approvedExpenses.amount.toLocaleString()}` : '$0.00'} 
          icon={<CheckCircleIcon />} 
          color="success"
          isLoading={loadingKpis}
        />
      </Box>

      {/* Main Content Area */}
      <Card sx={{ backgroundColor: '#16213e', borderRadius: 4, mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)', px: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 56 } }}>
            <Tab label="Fuel Logs" />
            <Tab label="Expenses" />
          </Tabs>
        </Box>

        {/* Filters */}
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <TextField
            size="small"
            placeholder="Search..."
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
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: 2,
              }
            }}
          />

          <Select
            size="small"
            displayEmpty
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            input={<OutlinedInput sx={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 2, minWidth: 160 }} />}
            sx={{ color: typeFilter ? '#fff' : '#888' }}
          >
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="FUEL">Fuel</MenuItem>
            <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
            <MenuItem value="TOLL">Toll</MenuItem>
            <MenuItem value="PARKING">Parking</MenuItem>
            <MenuItem value="OTHER">Other</MenuItem>
          </Select>

          <Select
            size="small"
            displayEmpty
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            input={<OutlinedInput sx={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 2, minWidth: 180 }} />}
            sx={{ color: statusFilter ? '#fff' : '#888' }}
          >
            <MenuItem value="">All Lifecycle States</MenuItem>
            {Object.keys(STATUS_CONFIG).map((st) => (
              <MenuItem key={st} value={st}>{STATUS_CONFIG[st].label}</MenuItem>
            ))}
          </Select>

          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
            <Button onClick={() => setShowFuelModal(true)} variant="outlined" color="primary" startIcon={<AddIcon />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, flex: { xs: 1, sm: 'none' } }}>
              Add Fuel
            </Button>
            <Button onClick={() => setShowCreateModal(true)} variant="contained" color="primary" startIcon={<AddIcon />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, flex: { xs: 1, sm: 'none' } }}>
              Add Expense
            </Button>
          </Box>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ width: '100%' }}>
          {tabValue === 0 && (
            <TableContainer>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Vehicle</TableCell>
                    <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Driver</TableCell>
                    <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Date</TableCell>
                    <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Liters</TableCell>
                    <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Cost</TableCell>
                    <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Odometer</TableCell>
                    <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Status</TableCell>
                    <TableCell align="right" sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingFuel ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                        <Skeleton variant="rectangular" width="100%" height={100} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
                      </TableCell>
                    </TableRow>
                  ) : fuelLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#666', borderBottom: 'none' }}>
                        No fuel logs available in this period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    fuelLogs.map((log) => (
                      <TableRow key={log.id} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.04)' } }}>
                        <TableCell sx={{ color: '#e0e0e0', fontWeight: 500 }}>{log.vehicle?.registrationNumber || log.vehicleId}</TableCell>
                        <TableCell sx={{ color: '#aaa' }}>{log.driver?.name || 'N/A'}</TableCell>
                        <TableCell sx={{ color: '#aaa' }}>{new Date(log.filledAt).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>{log.liters} L</TableCell>
                        <TableCell sx={{ color: '#e67e22', fontWeight: 600 }}>${(log.liters * log.pricePerLiter).toFixed(2)}</TableCell>
                        <TableCell sx={{ color: '#aaa' }}>{log.odometer} km</TableCell>
                        <TableCell>
                          <Chip label={log.fuelType} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#ccc', borderRadius: 1.5, fontSize: '0.7rem', fontWeight: 600 }} />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" sx={{ color: '#888' }}>
                            <TimelineIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tabValue === 1 && (
            <TableContainer>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Expense ID</TableCell>
                    <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Vendor / Receipt</TableCell>
                    <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Category</TableCell>
                    <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Amount</TableCell>
                    <TableCell sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Lifecycle</TableCell>
                    <TableCell align="right" sx={{ color: '#888', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingExpenses ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                        <Skeleton variant="rectangular" width="100%" height={100} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
                      </TableCell>
                    </TableRow>
                  ) : filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#666', borderBottom: 'none' }}>
                        No expenses match your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((exp) => (
                      <TableRow key={exp.id} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.04)' } }}>
                        <TableCell sx={{ fontWeight: 600, color: '#3498db' }}>{exp.expenseNumber}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#e0e0e0', fontWeight: 500 }}>{exp.vendor}</Typography>
                          <Typography variant="caption" sx={{ color: '#777' }}>Receipt: {exp.receiptNumber || 'N/A'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={exp.type} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#ccc', borderRadius: 1.5, fontSize: '0.7rem', fontWeight: 600 }} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#fff' }}>${parseFloat(exp.amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={STATUS_CONFIG[exp.status]?.label || exp.status} 
                            color={STATUS_CONFIG[exp.status]?.color || 'default'}
                            size="small" 
                            sx={{ fontWeight: 600, borderRadius: 1.5 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" sx={{ color: '#888', '&:hover': { color: '#3498db', backgroundColor: 'rgba(52,152,219,0.1)' } }}>
                            <TimelineIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Card>

      {/* Create Expense Dialog */}
      <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, backgroundColor: '#1E293B', color: '#fff', backgroundImage: 'none' } }}>
        <form onSubmit={handleCreateExpense}>
          <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2 }}>
            <Typography variant="h6" fontWeight="bold">New Expense Claim</Typography>
          </DialogTitle>
          <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Expense Category</Typography>
              <Select
                fullWidth
                size="small"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                sx={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' }}
              >
                <MenuItem value="FUEL">Fuel Expense</MenuItem>
                <MenuItem value="MAINTENANCE">Fleet Maintenance</MenuItem>
                <MenuItem value="TOLL">Highway Toll</MenuItem>
                <MenuItem value="PARKING">Parking Fee</MenuItem>
                <MenuItem value="FINE">Traffic Fine</MenuItem>
                <MenuItem value="OTHER">Other Expense</MenuItem>
              </Select>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Vendor / Station</Typography>
                <TextField
                  fullWidth
                  required
                  size="small"
                  placeholder="e.g. Shell #102"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' } }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Amount ($)</Typography>
                <TextField
                  fullWidth
                  required
                  type="number"
                  inputProps={{ step: "0.01" }}
                  size="small"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' } }}
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Receipt Number (Optional)</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. INV-99042"
                value={formData.receiptNumber}
                onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' } }}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Link to Vehicle (Required)</Typography>
              <Select
                fullWidth
                required
                size="small"
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                sx={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' }}
              >
                <MenuItem value="">Select Vehicle</MenuItem>
                {Array.isArray(vehicles) && vehicles.map((v) => (
                  <MenuItem key={v.id} value={v.id}>{v.registrationNumber} - {v.name}</MenuItem>
                ))}
              </Select>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Button onClick={() => setShowCreateModal(false)} sx={{ color: '#888', textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Submit Claim</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Create Fuel Dialog */}
      <Dialog open={showFuelModal} onClose={() => setShowFuelModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, backgroundColor: '#1E293B', color: '#fff', backgroundImage: 'none' } }}>
        <form onSubmit={handleCreateFuel}>
          <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2 }}>
            <Typography variant="h6" fontWeight="bold">New Fuel Log</Typography>
          </DialogTitle>
          <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Vehicle</Typography>
              <Select
                fullWidth
                required
                size="small"
                value={fuelData.vehicleId}
                onChange={(e) => setFuelData({ ...fuelData, vehicleId: e.target.value })}
                sx={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' }}
              >
                <MenuItem value="">Select Vehicle</MenuItem>
                {Array.isArray(vehicles) && vehicles.map((v) => (
                  <MenuItem key={v.id} value={v.id}>{v.registrationNumber} - {v.name}</MenuItem>
                ))}
              </Select>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Fuel Type</Typography>
                <Select
                  fullWidth
                  required
                  size="small"
                  value={fuelData.fuelType}
                  onChange={(e) => setFuelData({ ...fuelData, fuelType: e.target.value })}
                  sx={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' }}
                >
                  <MenuItem value="DIESEL">Diesel</MenuItem>
                  <MenuItem value="PETROL">Petrol</MenuItem>
                  <MenuItem value="ELECTRIC">Electric</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Payment Method</Typography>
                <Select
                  fullWidth
                  required
                  size="small"
                  value={fuelData.paymentMethod}
                  onChange={(e) => setFuelData({ ...fuelData, paymentMethod: e.target.value })}
                  sx={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' }}
                >
                  <MenuItem value="CASH">Cash</MenuItem>
                  <MenuItem value="CORPORATE_CARD">Corporate Card</MenuItem>
                  <MenuItem value="FUEL_CARD">Fuel Card</MenuItem>
                </Select>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Liters / Volume</Typography>
                <TextField
                  fullWidth
                  required
                  type="number"
                  inputProps={{ step: "0.1" }}
                  size="small"
                  placeholder="0.0"
                  value={fuelData.liters}
                  onChange={(e) => setFuelData({ ...fuelData, liters: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' } }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Price per Liter ($)</Typography>
                <TextField
                  fullWidth
                  required
                  type="number"
                  inputProps={{ step: "0.01" }}
                  size="small"
                  placeholder="0.00"
                  value={fuelData.pricePerLiter}
                  onChange={(e) => setFuelData({ ...fuelData, pricePerLiter: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' } }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Odometer Reading</Typography>
                <TextField
                  fullWidth
                  required
                  type="number"
                  size="small"
                  placeholder="0"
                  value={fuelData.odometer}
                  onChange={(e) => setFuelData({ ...fuelData, odometer: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' } }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, mb: 1, display: 'block' }}>Date Filled</Typography>
                <TextField
                  fullWidth
                  required
                  type="date"
                  size="small"
                  value={fuelData.filledAt}
                  onChange={(e) => setFuelData({ ...fuelData, filledAt: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, color: '#fff' } }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Button onClick={() => setShowFuelModal(false)} sx={{ color: '#888', textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createFuelMutation.isPending} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Save Log</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
