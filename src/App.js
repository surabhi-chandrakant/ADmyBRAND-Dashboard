import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Users, DollarSign, Target, Moon, Sun, Download, 
  Filter, Search, ChevronDown, RefreshCw, Bell, 
  Settings, Eye, TrendingDown, Activity, Globe, 
  Smartphone, FileText, FileSpreadsheet, ChevronRight, ChevronLeft, User, 
  LayoutDashboard, MessageSquare, X, Check, ArrowUpRight
} from 'lucide-react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import axios from 'axios';

const ADmyBRANDDashboard = () => {
  // State Management
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [currentData, setCurrentData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [dashboardConfig, setDashboardConfig] = useState(() => {
    const savedConfig = localStorage.getItem('dashboardConfig');
    return savedConfig ? JSON.parse(savedConfig) : {
      showRevenue: true,
      showUsers: true,
      showConversions: true,
      showPageViews: true,
      showPerformanceChart: true,
      showDeviceChart: true,
      showCampaignTable: true
    };
  });
  const [selectedCampaignTypes, setSelectedCampaignTypes] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    liveUsers: 1247,
    bounceRate: 24.5,
    sessionDuration: '3:42',
    pageViews: 18542
  });

  // Generate realistic time series data
  const generateTimeSeriesData = useCallback((metric, days = 30) => {
    const data = [];
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    
    const baseValues = {
      revenue: { base: 50000, trendFactor: 20000, randomFactor: 10000, growth: 500 },
      users: { base: 2500, trendFactor: 800, randomFactor: 400, growth: 25 },
      conversions: { base: 180, trendFactor: 60, randomFactor: 30, growth: 2 },
      sessions: { base: 5200, trendFactor: 1500, randomFactor: 800, growth: 45 }
    };

    const { base, trendFactor, randomFactor, growth } = baseValues[metric] || 
      { base: 100, trendFactor: 50, randomFactor: 25, growth: 0 };

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const trend = Math.sin((i / days) * Math.PI * 2) * 0.3;
      const randomVariation = (Math.random() - 0.5) * 0.4;
      const growthOverTime = i * growth;
      
      const value = Math.max(0, Math.round(
        base + trend * trendFactor + randomVariation * randomFactor + growthOverTime
      ));
      
      data.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value,
        growth: Math.round((Math.random() - 0.3) * 20 * 100) / 100
      });
    }
    return data;
  }, []);

  // Generate device distribution data
  const generateDeviceData = () => [
    { name: 'Desktop', value: 45, color: '#3B82F6', users: 11250 },
    { name: 'Mobile', value: 42, color: '#10B981', users: 10500 },
    { name: 'Tablet', value: 10, color: '#F59E0B', users: 2500 },
    { name: 'Smart TV', value: 3, color: '#EF4444', users: 750 }
  ];

  // Generate campaign performance data
  const generateEnhancedTableData = useCallback(() => {
    const campaignTypes = [
      { type: 'Seasonal', status: 'Active', performance: 1.2 },
      { type: 'Brand', status: 'Active', performance: 1.1 },
      { type: 'Product', status: 'Paused', performance: 0.9 },
      { type: 'Educational', status: 'Completed', performance: 1.0 },
      { type: 'Promotional', status: 'Active', performance: 1.3 },
      { type: 'Lead Gen', status: 'Active', performance: 1.15 },
      { type: 'Retargeting', status: 'Active', performance: 1.25 },
      { type: 'Retention', status: 'Active', performance: 1.18 }
    ];

    return campaignTypes.map((campaign, index) => {
      const perfFactor = campaign.performance;
      const baseImpressions = 50000 + Math.random() * 200000;
      const baseClicks = 1200 + Math.random() * 4000;
      const baseCTR = 1.5 + Math.random() * 4;
      const baseCost = 800 + Math.random() * 2500;
      const baseConversions = 15 + Math.random() * 85;
      const baseROAS = 1.8 + Math.random() * 3.2;
      const baseCPC = 0.5 + Math.random() * 2;
      const baseQuality = 6 + Math.random() * 4;

      return {
        id: index + 1,
        campaign: `${campaign.type} Campaign ${index + 1}`,
        type: campaign.type,
        status: campaign.status,
        impressions: Math.round(baseImpressions * perfFactor).toFixed(0),
        clicks: Math.round(baseClicks * perfFactor).toFixed(0),
        ctr: (baseCTR * perfFactor).toFixed(2) + '%',
        cost: '$' + Math.round(baseCost * perfFactor).toFixed(0),
        conversions: Math.round(baseConversions * perfFactor).toFixed(0),
        roas: (baseROAS * perfFactor).toFixed(1) + 'x',
        cpc: '$' + (baseCPC * perfFactor).toFixed(2),
        quality: Math.round(baseQuality * perfFactor)
      };
    });
  }, []);

  // Initialize data with proper date ranges
  useEffect(() => {
    const loadData = () => {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
      
      setCurrentData({
        revenue: generateTimeSeriesData('revenue', days),
        users: generateTimeSeriesData('users', days),
        conversions: generateTimeSeriesData('conversions', days),
        sessions: generateTimeSeriesData('sessions', days),
        devices: generateDeviceData(),
        campaigns: generateEnhancedTableData()
      });
      setLoading(false);
    };

    const timer = setTimeout(loadData, 800);
    return () => clearTimeout(timer);
  }, [dateRange, generateTimeSeriesData, generateEnhancedTableData]);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        liveUsers: Math.max(0, prev.liveUsers + Math.round((Math.random() - 0.4) * 50)),
        bounceRate: Math.max(15, Math.min(45, prev.bounceRate + (Math.random() - 0.5) * 1.5)),
        sessionDuration: `${Math.floor(2 + Math.random() * 3)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        pageViews: Math.max(0, prev.pageViews + Math.round(Math.random() * 25))
      }));

      // Random notifications
      if (Math.random() < 0.25) {
        const messages = [
          'New conversion detected on Summer Sale campaign!',
          'Mobile traffic increased by 8% this hour',
          'Retargeting campaign reached its daily budget',
          'Goal milestone reached: 1000 conversions today',
          'New user segment created: High-value customers'
        ];
        setNotifications(prev => [...prev.slice(-2), {
          id: Date.now(),
          message: messages[Math.floor(Math.random() * messages.length)],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('dashboardConfig', JSON.stringify(dashboardConfig));
  }, [dashboardConfig]);

  // Filtered and sorted table data with pagination
  const filteredAndSortedData = useMemo(() => {
    if (!currentData?.campaigns) return [];
    
    let filtered = currentData.campaigns.filter(campaign => {
      const matchesSearch = campaign.campaign.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedCampaignTypes.length === 0 || 
                         selectedCampaignTypes.includes(campaign.type);
      
      const matchesStatus = selectedStatuses.length === 0 || 
                          selectedStatuses.includes(campaign.status);
      
      return matchesSearch && matchesType && matchesStatus;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (typeof aValue === 'string') {
          aValue = parseFloat(aValue.replace(/[$,%x]/g, ''));
          bValue = parseFloat(bValue.replace(/[$,%x]/g, ''));
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [currentData?.campaigns, searchTerm, sortConfig, selectedCampaignTypes, selectedStatuses]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);

  // Export functions
  const exportToCSV = () => {
    const csvData = filteredAndSortedData.map(item => ({
      ID: item.id,
      Campaign: item.campaign,
      Type: item.type,
      Status: item.status,
      Impressions: item.impressions,
      Clicks: item.clicks,
      CTR: item.ctr,
      Cost: item.cost,
      Conversions: item.conversions,
      ROAS: item.roas,
      CPC: item.cpc,
      'Quality Score': item.quality
    }));

    const csvHeaders = Object.keys(csvData[0]).join(',') + '\n';
    const csvRows = csvData.map(item => Object.values(item).join(',')).join('\n');
    const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `campaign_performance_${new Date().toISOString().split('T')[0]}.csv`);
    setExportMenuOpen(false);
  };

  const exportToExcel = () => {
    const excelData = filteredAndSortedData.map(item => ({
      ID: item.id,
      Campaign: item.campaign,
      Type: item.type,
      Status: item.status,
      Impressions: item.impressions,
      Clicks: item.clicks,
      CTR: parseFloat(item.ctr),
      Cost: parseFloat(item.cost.replace('$', '')),
      Conversions: item.conversions,
      ROAS: parseFloat(item.roas),
      CPC: parseFloat(item.cpc.replace('$', '')),
      'Quality Score': item.quality
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Campaign Performance');
    XLSX.writeFile(workbook, `campaign_performance_${new Date().toISOString().split('T')[0]}.xlsx`);
    setExportMenuOpen(false);
  };

  // AI Assistant functions
  const sendMessage = async () => {
  if (message.trim() === '') return;

  const userMessage = {
    id: Date.now(),
    text: message,
    sender: 'user',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  setChatMessages(prev => [...prev, userMessage]);
  setMessage('');
  setIsLoadingAI(true);

  // Mock responses as fallback or for local dev
  const mockResponses = [
    "Your campaign performance shows a 12% increase in conversions compared to last week.",
    "I recommend focusing on mobile users as they show higher engagement rates.",
    "The seasonal campaign is performing exceptionally well with a ROAS of 3.2x.",
    "Your bounce rate has decreased by 5% since last month - great job!",
    "Consider increasing budget for the top performing campaigns."
  ];

  try {
    const apiKey = import.meta.env.VITE_API_KEY;

    if (!apiKey) throw new Error("Missing API key");

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: message }] }]
      }
    );

    const botText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      mockResponses[Math.floor(Math.random() * mockResponses.length)];

    const botMessage = {
      id: Date.now() + 1,
      text: botText,
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, botMessage]);
  } catch (error) {
    console.warn("Using mock response due to error:", error.message);

    const fallbackMessage = {
      id: Date.now() + 1,
      text: mockResponses[Math.floor(Math.random() * mockResponses.length)],
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, fallbackMessage]);
  } finally {
    setIsLoadingAI(false);
  }
};
    


  // Dashboard config functions
  const toggleMetric = (metric) => {
    setDashboardConfig(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  // Date range filtered data for charts
  const getFilteredChartData = useMemo(() => {
    if (!currentData) return [];
    return currentData[selectedMetric] || [];
  }, [currentData, selectedMetric]);

  // MetricCard component
  const MetricCard = ({ title, value, change, icon: Icon, color, subtitle, metricKey }) => {
    if (!dashboardConfig[metricKey]) return null;
    
    return (
      <div className={`group p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
        darkMode ? 'bg-gray-800 border-gray-600 hover:border-gray-500' : 'bg-white border-gray-200 hover:border-gray-300'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-bold px-2 py-1 rounded-full ${
              change > 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
            }`}>
              {change > 0 ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />}
              {Math.abs(change)}%
            </span>
          </div>
        </div>
        <h3 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </h3>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
        {subtitle && (
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{subtitle}</p>
        )}
        
        {currentData?.[metricKey.replace('show', '').toLowerCase()]?.length > 0 && (
          <div className="mt-3 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={currentData[metricKey.replace('show', '').toLowerCase()].slice(-10)}
                margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
              >
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={change > 0 ? '#10B981' : '#EF4444'} 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  // Loading skeleton
  const LoadingSkeleton = ({ height = "h-32" }) => (
    <div className={`animate-pulse ${height} rounded-2xl relative overflow-hidden ${
      darkMode ? 'bg-gray-700' : 'bg-gray-200'
    }`}>
      <div className={`absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r ${
        darkMode ? 'from-gray-700 via-gray-600 to-gray-700' : 'from-gray-200 via-gray-100 to-gray-200'
      }`}></div>
    </div>
  );

  if (loading) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Loading ADmyBRAND Insights...
                </h2>
                <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Fetching your analytics data
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1,2,3,4].map(i => <LoadingSkeleton key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <LoadingSkeleton height="h-96" />
              <LoadingSkeleton height="h-96" />
            </div>
            <LoadingSkeleton height="h-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <header className={`border-b backdrop-blur-md sticky top-0 z-50 transition-all duration-300 ${
        darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className={`text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                  ADmyBRAND Insights
                </h1>
                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Real-time Analytics Dashboard • {realTimeMetrics.liveUsers.toLocaleString()} users online
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Real-time metrics */}
              <div className="hidden lg:flex items-center space-x-6">
                <div className="text-center">
                  <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {realTimeMetrics.liveUsers.toLocaleString()}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Live Users</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {realTimeMetrics.bounceRate}%
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Bounce Rate</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {realTimeMetrics.sessionDuration}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg. Session</div>
                </div>
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button 
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setNotifications([])}
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>
              </div>
              
              {/* User Profile */}
              <div className="relative">
                <button 
                  className={`p-2 rounded-full transition-colors ${
                    darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                >
                  <User className="w-5 h-5" />
                </button>
                
                {profileMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 z-50 ${
                    darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>John Doe</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Admin</p>
                    </div>
                    <button 
                      className={`flex items-center w-full px-4 py-2 text-sm text-left ${
                        darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setDarkMode(!darkMode)}
                    >
                      {darkMode ? <Sun className="w-4 h-4 mr-3" /> : <Moon className="w-4 h-4 mr-3" />}
                      {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button 
                      className={`flex items-center w-full px-4 py-2 text-sm text-left ${
                        darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setExportMenuOpen(true)}
                    >
                      <Download className="w-4 h-4 mr-3" />
                      Export Data
                    </button>
                    <button 
                      className={`flex items-center w-full px-4 py-2 text-sm text-left ${
                        darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setDashboardConfig({
                          showRevenue: true,
                          showUsers: true,
                          showConversions: true,
                          showPageViews: true,
                          showPerformanceChart: true,
                          showDeviceChart: true,
                          showCampaignTable: true
                        });
                        setProfileMenuOpen(false);
                      }}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-3" />
                      Reset Dashboard
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700"></div>
                    <button 
                      className={`flex items-center w-full px-4 py-2 text-sm text-left ${
                        darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'
                      }`}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </button>
                  </div>
                )}
              </div>
              
              {/* Date Range Selector */}
              <select 
                className={`px-3 py-1 rounded-lg border transition-all text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`} 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              {/* Chatbot toggle */}
              <button
                onClick={() => setChatbotOpen(!chatbotOpen)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  chatbotOpen ? 'bg-blue-600 text-white' : 
                  darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className={`border-b sticky top-16 z-40 ${
        darkMode ? 'border-gray-700 bg-gray-800/80 backdrop-blur-md' : 'border-gray-200 bg-white/80 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'traffic', label: 'Traffic', icon: Globe },
              { id: 'devices', label: 'Devices', icon: Smartphone },
              { id: 'campaigns', label: 'Campaigns', icon: Target }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-2 border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-8">
        {/* Dashboard Config Panel */}
        <div className={`mb-8 p-4 rounded-lg ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <LayoutDashboard className="inline mr-2 w-4 h-4" />
              Customize Dashboard
            </h3>
            <button 
              className={`p-1 rounded-full ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
              }`}
              onClick={() => {
                setDashboardConfig({
                  showRevenue: true,
                  showUsers: true,
                  showConversions: true,
                  showPageViews: true,
                  showPerformanceChart: true,
                  showDeviceChart: true,
                  showCampaignTable: true
                });
              }}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {[
              { key: 'showRevenue', label: 'Revenue', icon: DollarSign },
              { key: 'showUsers', label: 'Users', icon: Users },
              { key: 'showConversions', label: 'Conversions', icon: Target },
              { key: 'showPageViews', label: 'Page Views', icon: Eye },
              { key: 'showPerformanceChart', label: 'Performance', icon: TrendingUp },
              { key: 'showDeviceChart', label: 'Devices', icon: Smartphone },
              { key: 'showCampaignTable', label: 'Campaigns', icon: FileText }
            ].map(item => (
              <button
                key={item.key}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                  dashboardConfig[item.key] 
                    ? darkMode 
                      ? 'bg-blue-900/50 text-blue-400 border border-blue-800' 
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                    : darkMode 
                      ? 'hover:bg-gray-700 text-gray-400' 
                      : 'hover:bg-gray-100 text-gray-600'
                }`}
                onClick={() => toggleMetric(item.key)}
              >
                {dashboardConfig[item.key] ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <item.icon className="w-4 h-4" />
                )}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={`$${(currentData?.revenue?.reduce((sum, item) => sum + item.value, 0)?.toLocaleString() || '0')}`}
            change={12.5}
            icon={DollarSign}
            color="bg-gradient-to-r from-emerald-500 to-green-600"
            subtitle={`${dateRange} trend`}
            metricKey="showRevenue"
          />
          <MetricCard
            title="Active Users"
            value={`${(currentData?.users?.reduce((sum, item) => sum + item.value, 0)?.toLocaleString() || '0')}`}
            change={8.2}
            icon={Users}
            color="bg-gradient-to-r from-blue-500 to-indigo-600"
            subtitle={`${dateRange} unique visitors`}
            metricKey="showUsers"
          />
          <MetricCard
            title="Conversions"
            value={`${(currentData?.conversions?.reduce((sum, item) => sum + item.value, 0)?.toLocaleString() || '0')}`}
            change={-2.4}
            icon={Target}
            color="bg-gradient-to-r from-purple-500 to-pink-600"
            subtitle={`${dateRange} goal completions`}
            metricKey="showConversions"
          />
          <MetricCard
            title="Page Views"
            value={realTimeMetrics.pageViews.toLocaleString()}
            change={15.8}
            icon={Eye}
            color="bg-gradient-to-r from-orange-500 to-red-600"
            subtitle="real-time tracking"
            metricKey="showPageViews"
          />
        </div>

        {/* Dynamic Charts Section */}
        {dashboardConfig.showPerformanceChart && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Performance Chart */}
            <div className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-500 hover:shadow-xl ${
              darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Performance Trends
                </h3>
                <div className="flex items-center space-x-2">
                  <select 
                    value={selectedMetric} 
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className={`px-3 py-1 rounded-lg border text-sm ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="revenue">Revenue</option>
                    <option value="users">Users</option>
                    <option value="conversions">Conversions</option>
                    <option value="sessions">Sessions</option>
                  </select>
                  <button className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}>
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={getFilteredChartData}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                  <XAxis 
                    dataKey="day" 
                    stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                    fontSize={12}
                  />
                  <YAxis 
                    stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                      border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                      borderRadius: '12px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    fill="url(#colorGradient)"
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Device Analytics */}
            {dashboardConfig.showDeviceChart && (
              <div className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-500 hover:shadow-xl ${
                darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'
              }`}>
                <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Device Distribution
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={currentData?.devices || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                          startAngle={90}
                          endAngle={450}
                        >
                          {(currentData?.devices || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                            border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                            borderRadius: '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col justify-center space-y-4">
                    {(currentData?.devices || []).map((device, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: device.color }}></div>
                          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {device.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {device.value}%
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {device.users.toLocaleString()} users
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Campaign Table */}
        {dashboardConfig.showCampaignTable && (
          <div className={`rounded-2xl border backdrop-blur-sm transition-all duration-500 hover:shadow-xl ${
            darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Campaign Performance
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 pr-4 py-2 rounded-lg border transition-all ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500' : 'bg-white border-gray-300 focus:ring-2 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  
                  {/* Filter Button */}
                  <div className="relative">
                    <button 
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                    >
                      <Filter className="w-4 h-4" />
                      <span>Filter</span>
                    </button>
                    
                    {filterMenuOpen && (
                      <div className={`absolute right-0 mt-2 w-64 rounded-md shadow-lg py-1 z-50 ${
                        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                      }`}>
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filters</h4>
                        </div>
                        
                        <div className="px-4 py-2">
                          <h5 className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Campaign Type</h5>
                          <div className="space-y-2">
                            {['Seasonal', 'Brand', 'Product', 'Educational', 'Promotional', 'Lead Gen', 'Retargeting', 'Retention'].map(type => (
                              <div key={type} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`type-${type}`}
                                  checked={selectedCampaignTypes.includes(type)}
                                  onChange={() => {
                                    setSelectedCampaignTypes(prev => 
                                      prev.includes(type) 
                                        ? prev.filter(t => t !== type) 
                                        : [...prev, type]
                                    );
                                  }}
                                  className={`rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
                                  }`}
                                />
                                <label 
                                  htmlFor={`type-${type}`}
                                  className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                                >
                                  {type}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                          <h5 className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Status</h5>
                          <div className="space-y-2">
                            {['Active', 'Paused', 'Completed'].map(status => (
                              <div key={status} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`status-${status}`}
                                  checked={selectedStatuses.includes(status)}
                                  onChange={() => {
                                    setSelectedStatuses(prev => 
                                      prev.includes(status) 
                                        ? prev.filter(s => s !== status) 
                                        : [...prev, status]
                                    );
                                  }}
                                  className={`rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
                                  }`}
                                />
                                <label 
                                  htmlFor={`status-${status}`}
                                  className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                                >
                                  {status}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                          <button
                            className={`text-sm px-3 py-1 rounded ${
                              darkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-100'
                            }`}
                            onClick={() => {
                              setSelectedCampaignTypes([]);
                              setSelectedStatuses([]);
                            }}
                          >
                            Clear All
                          </button>
                          <button
                            className={`text-sm px-3 py-1 rounded ml-2 ${
                              darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                            onClick={() => setFilterMenuOpen(false)}
                            >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Export Button */}
                  <div className="relative">
                    <button 
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      onClick={() => setExportMenuOpen(!exportMenuOpen)}
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                    
                    {exportMenuOpen && (
                      <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50 ${
                        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                      }`}>
                        <button 
                          className={`flex items-center w-full px-4 py-2 text-sm text-left ${
                            darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={exportToCSV}
                        >
                          <FileText className="w-4 h-4 mr-3" />
                          CSV
                        </button>
                        <button 
                          className={`flex items-center w-full px-4 py-2 text-sm text-left ${
                            darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={exportToExcel}
                        >
                          <FileSpreadsheet className="w-4 h-4 mr-3" />
                          Excel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    {[
                      { key: 'campaign', label: 'Campaign' },
                      { key: 'type', label: 'Type' },
                      { key: 'status', label: 'Status' },
                      { key: 'impressions', label: 'Impressions' },
                      { key: 'clicks', label: 'Clicks' },
                      { key: 'ctr', label: 'CTR' },
                      { key: 'cost', label: 'Cost' },
                      { key: 'conversions', label: 'Conversions' },
                      { key: 'roas', label: 'ROAS' },
                      { key: 'quality', label: 'Quality Score' }
                    ].map(column => (
                      <th 
                        key={column.key}
                        onClick={() => setSortConfig({
                          key: column.key,
                          direction: sortConfig.key === column.key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                        })}
                        className={`px-6 py-4 text-left text-sm font-medium cursor-pointer hover:bg-opacity-80 transition-colors ${
                          darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{column.label}</span>
                          {sortConfig.key === column.key && (
                            <ChevronDown className={`w-4 h-4 transition-transform ${
                              sortConfig.direction === 'desc' ? 'rotate-180' : ''
                            }`} />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedData.map((campaign, index) => (
                    <tr 
                      key={campaign.id} 
                      className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-all duration-200 hover:shadow-md`}
                    >
                      <td className={`px-6 py-4 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div>
                          <div>{campaign.campaign}</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ID: #{campaign.id}
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.type === 'Seasonal' ? 'bg-orange-100 text-orange-800' :
                          campaign.type === 'Brand' ? 'bg-blue-100 text-blue-800' :
                          campaign.type === 'Product' ? 'bg-green-100 text-green-800' :
                          campaign.type === 'Lead Gen' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4`}>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {parseInt(campaign.impressions).toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {parseInt(campaign.clicks).toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 font-medium ${
                        parseFloat(campaign.ctr) > 3 ? 'text-green-600' : 
                        parseFloat(campaign.ctr) > 2 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {campaign.ctr}
                      </td>
                      <td className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {campaign.cost}
                      </td>
                      <td className={`px-6 py-4 font-medium text-blue-600`}>
                        {campaign.conversions}
                      </td>
                      <td className={`px-6 py-4 font-bold ${
                        parseFloat(campaign.roas) > 3 ? 'text-green-600' : 
                        parseFloat(campaign.roas) > 2 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {campaign.roas}
                      </td>
                      <td className={`px-6 py-4`}>
                        <div className="flex items-center space-x-2">
                          <div className={`text-sm font-medium ${
                            campaign.quality >= 8 ? 'text-green-600' :
                            campaign.quality >= 6 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {campaign.quality}/10
                          </div>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                campaign.quality >= 8 ? 'bg-green-500' :
                                campaign.quality >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${campaign.quality * 10}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length} campaigns
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    className={`p-2 rounded-lg border transition-colors ${
                      currentPage === 1 
                        ? darkMode 
                          ? 'border-gray-700 text-gray-500 cursor-not-allowed' 
                          : 'border-gray-300 text-gray-400 cursor-not-allowed'
                        : darkMode 
                          ? 'border-gray-600 text-gray-400 hover:bg-gray-700' 
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
                          currentPage === pageNum
                            ? darkMode
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-blue-600 border-blue-600 text-white'
                            : darkMode
                              ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button 
                    className={`p-2 rounded-lg border transition-colors ${
                      currentPage === totalPages 
                        ? darkMode 
                          ? 'border-gray-700 text-gray-500 cursor-not-allowed' 
                          : 'border-gray-300 text-gray-400 cursor-not-allowed'
                        : darkMode 
                          ? 'border-gray-600 text-gray-400 hover:bg-gray-700' 
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Activity Feed */}
        {notifications.length > 0 && (
          <div className={`mt-8 p-6 rounded-2xl border backdrop-blur-sm ${
            darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Real-time Activity
            </h3>
            <div className="space-y-3">
              {notifications.slice(-3).map(notification => (
                <div key={notification.id} className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {notification.message}
                    </span>
                  </div>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {notification.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      {/* Chatbot Panel */}
      <div className={`fixed bottom-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        chatbotOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className={`w-96 h-[32rem] rounded-t-lg shadow-xl flex flex-col ${
          darkMode ? 'bg-gray-800 border-l border-t border-r border-gray-700' : 'bg-white border-l border-t border-r border-gray-200'
        }`}>
          <div className={`p-3 rounded-t-lg flex items-center justify-between ${
            darkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Analytics AI Assistant
              </span>
            </div>
            <button 
              className={`p-1 rounded-full ${
                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
              }`}
              onClick={() => setChatbotOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className={`p-4 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Hi! I'm your AI analytics assistant. Ask me anything about your dashboard data, 
                  trends, or campaign performance. I can provide insights and recommendations.
                </p>
                <div className="mt-3 space-y-2">
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Try asking:
                  </p>
                  <button 
                    className={`text-xs px-3 py-1 rounded-full ${
                      darkMode ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setMessage("How is my campaign performing?")}
                  >
                    "How is my campaign performing?"
                  </button>
                  <button 
                    className={`text-xs px-3 py-1 rounded-full ${
                      darkMode ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setMessage("What are the key trends this week?")}
                  >
                    "What are the key trends this week?"
                  </button>
                </div>
              </div>
            ) : (
              chatMessages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs p-3 rounded-lg ${
                    msg.sender === 'user' 
                      ? darkMode 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-600 text-white'
                      : darkMode 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-100 text-gray-700'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender === 'user' ? 'text-blue-200' : darkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isLoadingAI && (
              <div className="flex justify-start">
                <div className={`p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about your data..."
                className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                disabled={isLoadingAI}
              />
              <button
                className={`p-2 rounded-lg ${
                  darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                onClick={sendMessage}
                disabled={isLoadingAI || message.trim() === ''}
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ADmyBRANDDashboard;