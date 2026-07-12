import React from 'react';
import { Box, Card, Typography, CircularProgress } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#e74c3c'];

export default function AnalyticsCharts({ financialData, isLoading }) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!financialData?.charts) return null;

  const { expenseByCategory, maintenanceByType } = financialData.charts;

  // Format data for PieChart
  const expenseData = expenseByCategory?.map(item => ({
    name: item.type,
    value: item._sum.amount || 0
  })) || [];

  const maintenanceData = maintenanceByType?.map(item => ({
    name: item.maintenanceType,
    value: item._sum.actualCost || 0
  })) || [];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
      
      {/* Expenses by Category */}
      <Card sx={{ backgroundColor: '#16213E', borderRadius: 4, p: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#fff', mb: 2 }}>
          Expenses by Category
        </Typography>
        <Box sx={{ height: 280 }}>
          {expenseData.length === 0 ? (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="#666">No expense data available</Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  innerRadius={75}
                  outerRadius={100}
                  cornerRadius={6}
                  paddingAngle={5}
                  dataKey="value"
                  cy="45%"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Box>
      </Card>

      {/* Maintenance by Type */}
      <Card sx={{ backgroundColor: '#16213E', borderRadius: 4, p: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#fff', mb: 2 }}>
          Maintenance Costs by Type
        </Typography>
        <Box sx={{ height: 280 }}>
          {maintenanceData.length === 0 ? (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="#666">No maintenance data available</Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#888" tick={{ fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Bar dataKey="value" fill="#e67e22" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>
      </Card>

    </Box>
  );
}
