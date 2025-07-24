import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Activity, Users, Zap, TrendingUp, Eye, MousePointer, Calendar, Filter, Download, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data - in real app, this would come from your ClickHouse queries
  const [metrics, setMetrics] = useState({
    totalEvents: 47832,
    activeUsers: 2341,
    eventRate: 127,
    errorRate: 0.3
  });

  const eventTrends = [
    { time: '00:00', events: 45, users: 23 },
    { time: '04:00', events: 28, users: 15 },
    { time: '08:00', events: 89, users: 45 },
    { time: '12:00', events: 145, users: 78 },
    { time: '16:00', events: 167, users: 89 },
    { time: '20:00', events: 134, users: 67 },
    { time: '24:00', events: 98, users: 52 }
  ];

  const topEvents = [
    { name: 'page_view', count: 18429, change: 12.5 },
    { name: 'button_click', count: 8932, change: -3.2 },
    { name: 'user_signup', count: 2847, change: 24.1 },
    { name: 'purchase', count: 1923, change: 8.7 },
    { name: 'search', count: 1204, change: -1.4 }
  ];

  const userSegments = [
    { name: 'New Users', value: 35, color: '#3B82F6' },
    { name: 'Returning', value: 45, color: '#8B5CF6' },
    { name: 'Power Users', value: 20, color: '#10B981' }
  ];

  const deviceBreakdown = [
    { device: 'Desktop', sessions: 1847, percentage: 52.1 },
    { device: 'Mobile', sessions: 1293, percentage: 36.5 },
    { device: 'Tablet', sessions: 403, percentage: 11.4 }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
      // Update metrics with slight variations
      setMetrics(prev => ({
        totalEvents: prev.totalEvents + Math.floor(Math.random() * 100),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 20 - 10),
        eventRate: prev.eventRate + Math.floor(Math.random() * 20 - 10),
        errorRate: +(prev.errorRate + (Math.random() * 0.2 - 0.1)).toFixed(1)
      }));
    }, 1500);
  };

  const MetricCard = ({ title, value, icon: Icon, change, suffix = '' }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}{suffix}</p>
          {change && (
            <p className={`text-xs font-medium flex items-center mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 mr-1 ${change < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(change)}% vs yesterday
            </p>
          )}
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  const EventRow = ({ event, index }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
          {index + 1}
        </div>
        <div>
          <p className="font-medium text-gray-900">{event.name}</p>
          <p className="text-sm text-gray-500">{event.count.toLocaleString()} events</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-medium ${event.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {event.change >= 0 ? '+' : ''}{event.change}%
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Streamory Analytics</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Events"
            value={metrics.totalEvents}
            icon={Zap}
            change={12.5}
          />
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers}
            icon={Users}
            change={8.2}
          />
          <MetricCard
            title="Events/Min"
            value={metrics.eventRate}
            icon={Activity}
            change={-2.1}
          />
          <MetricCard
            title="Error Rate"
            value={metrics.errorRate}
            icon={TrendingUp}
            change={-15.3}
            suffix="%"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Event Trends */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Event Trends</h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Events</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Users</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={eventTrends}>
                <defs>
                  <linearGradient id="eventsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="events"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#eventsGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#usersGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* User Segments */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">User Segments</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={userSegments}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {userSegments.map((segment) => (
                <div key={segment.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }}></div>
                    <span className="text-sm text-gray-600">{segment.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{segment.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Events */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Events</h3>
            <div className="space-y-1">
              {topEvents.map((event, index) => (
                <EventRow key={event.name} event={event} index={index} />
              ))}
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Device Breakdown</h3>
            <div className="space-y-4">
              {deviceBreakdown.map((device) => (
                <div key={device.device} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{device.device}</span>
                    <span className="text-sm text-gray-500">{device.sessions.toLocaleString()} sessions</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${device.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{device.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
