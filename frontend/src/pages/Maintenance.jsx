import React, { useState } from 'react';
import { 
  Box, Typography, Button, TextField, Select, MenuItem, InputAdornment, Card
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import BuildIcon from '@mui/icons-material/Build';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useMaintenance, useTransitionMaintenance } from '../features/maintenance/api/useMaintenance';
import { useDebounce } from '../hooks/useDebounce';
import KpiCard from '../features/dashboard/components/KpiCard';
import MaintenanceTable from '../features/maintenance/components/MaintenanceTable';
import MaintenanceDialogs from '../features/maintenance/components/MaintenanceDialogs';
import toast from 'react-hot-toast';

export default function Maintenance() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState('');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('REQUEST');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const { data: maintenanceRes, isLoading } = useMaintenance({
    status: statusFilter,
    search: debouncedSearch
  });

  const transitionMutation = useTransitionMaintenance();

  const records = maintenanceRes?.data?.maintenanceLogs || maintenanceRes?.data?.items || Array.isArray(maintenanceRes?.data) ? maintenanceRes?.data : [];
  
  // Calculate KPIs
  const scheduled = records.filter(r => r.status === 'SCHEDULED' || r.status === 'IN_PROGRESS').length;
  const overdue = records.filter(r => r.status === 'PENDING').length;
  const completed = records.filter(r => r.status === 'COMPLETED').length;
  const costThisMonth = records.filter(r => r.status === 'COMPLETED').reduce((sum, r) => sum + (r.actualCost || 0), 0);

  const handleActionClick = async (action, record) => {
    if (action === 'CANCEL') {
      if (window.confirm('Are you sure you want to cancel this maintenance request?')) {
        try {
          await transitionMutation.mutateAsync({ id: record.id, action: 'cancel' });
          toast.success('Maintenance cancelled');
        } catch (e) {
          toast.error('Failed to cancel maintenance');
        }
      }
      return;
    }
    
    setSelectedRecord(record);
    setDialogMode(action);
    setDialogOpen(true);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#fff', letterSpacing: '-0.02em' }}>
            Maintenance
          </Typography>
          <Typography variant="body2" sx={{ color: '#888', mt: 0.5 }}>
            Vehicle Service & Repair Logs
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
        <KpiCard title="Active Services" value={scheduled} icon={<BuildIcon />} color="info" isLoading={isLoading} />
        <KpiCard title="Pending Requests" value={overdue} icon={<WarningIcon />} color="warning" isLoading={isLoading} />
        <KpiCard title="Completed" value={completed} icon={<CheckCircleIcon />} color="success" isLoading={isLoading} />
        <KpiCard title="Total Cost" value={`$${costThisMonth.toLocaleString()}`} icon={<AttachMoneyIcon />} color="error" isLoading={isLoading} />
      </Box>

      {/* Main Content Area */}
      <Card sx={{ backgroundColor: '#16213e', borderRadius: 4, mb: 3 }}>
        {/* Filters */}
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <TextField
            size="small"
            placeholder="Search logs..."
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
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="SCHEDULED">Scheduled</MenuItem>
            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </Select>

          <Box sx={{ flexGrow: 1 }} />
          
          <Button 
            variant="contained" color="warning" startIcon={<AddIcon />} 
            onClick={() => handleActionClick('REQUEST', null)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, flex: { xs: 1, sm: 'none' } }}
          >
            Request Maintenance
          </Button>
        </Box>

        <MaintenanceTable records={records} isLoading={isLoading} onAction={handleActionClick} />
      </Card>

      <MaintenanceDialogs 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        mode={dialogMode}
        record={selectedRecord}
      />
    </Box>
  );
}
