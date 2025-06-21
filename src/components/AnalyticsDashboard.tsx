
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSignIcon, FileTextIcon, TrendingUpIcon, AlertCircleIcon } from 'lucide-react';
import { loadInvoices } from '@/utils/invoiceStorage';
import { Invoice } from '@/types/invoice';

const AnalyticsDashboard: React.FC = () => {
  const [invoices] = React.useState<Invoice[]>(loadInvoices());
  const [filterPeriod, setFilterPeriod] = React.useState('3m');

  const getFilteredInvoices = () => {
    const now = new Date();
    let startDate = new Date();
    
    switch (filterPeriod) {
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0);
    }
    
    return invoices.filter(inv => new Date(inv.date) >= startDate);
  };

  const filteredInvoices = getFilteredInvoices();

  const stats = React.useMemo(() => {
    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const avgInvoiceSize = filteredInvoices.length > 0 ? totalRevenue / filteredInvoices.length : 0;
    const paidInvoices = filteredInvoices.filter(inv => inv.status === 'paid');
    const overdueInvoices = filteredInvoices.filter(inv => inv.status === 'overdue');
    
    return {
      totalRevenue,
      totalInvoices: filteredInvoices.length,
      avgInvoiceSize,
      paidCount: paidInvoices.length,
      overdueCount: overdueInvoices.length,
      paymentRate: filteredInvoices.length > 0 ? (paidInvoices.length / filteredInvoices.length) * 100 : 0
    };
  }, [filteredInvoices]);

  const monthlyData = React.useMemo(() => {
    const months: { [key: string]: { revenue: number, invoices: number } } = {};
    
    filteredInvoices.forEach(inv => {
      const month = new Date(inv.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!months[month]) {
        months[month] = { revenue: 0, invoices: 0 };
      }
      months[month].revenue += inv.total;
      months[month].invoices += 1;
    });
    
    return Object.entries(months)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [filteredInvoices]);

  const topCustomers = React.useMemo(() => {
    const customers: { [key: string]: { revenue: number, invoices: number } } = {};
    
    filteredInvoices.forEach(inv => {
      const customerName = inv.customer.name || 'Unknown';
      if (!customers[customerName]) {
        customers[customerName] = { revenue: 0, invoices: 0 };
      }
      customers[customerName].revenue += inv.total;
      customers[customerName].invoices += 1;
    });
    
    return Object.entries(customers)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredInvoices]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Select value={filterPeriod} onValueChange={setFilterPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">Last Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Invoice Size</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgInvoiceSize.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Invoices']} />
                <Line type="monotone" dataKey="invoices" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <div key={customer.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <span className="font-medium">{customer.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${customer.revenue.toFixed(2)}</div>
                  <div className="text-sm text-slate-500">{customer.invoices} invoices</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
