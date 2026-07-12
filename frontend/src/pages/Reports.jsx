import React from 'react';
import { Box, Typography } from '@mui/material';
import { useExecutiveReport, useFinancialReport } from '../features/reports/api/useReports';
import ExecutiveDashboard from '../features/reports/components/ExecutiveDashboard';
import AnalyticsCharts from '../features/reports/components/AnalyticsCharts';

export default function Reports() {
  const { data: executiveRes, isLoading: loadingExecutive } = useExecutiveReport({});
  const { data: financialRes, isLoading: loadingFinancial } = useFinancialReport({});

  const executiveData = executiveRes?.data;
  const financialData = financialRes?.data;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, pb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#fff', letterSpacing: '-0.02em' }}>
            Reports & Analytics
          </Typography>
          <Typography variant="body2" sx={{ color: '#888', mt: 0.5 }}>
            Executive Dashboard • Financials • Operations
          </Typography>
        </Box>
      </Box>

      <ExecutiveDashboard data={executiveData} isLoading={loadingExecutive} />
      <AnalyticsCharts financialData={financialData} isLoading={loadingFinancial} />
    </Box>
  );
}
