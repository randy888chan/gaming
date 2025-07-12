import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Market {
  id: string;
  title: string;
  volume: number; // USDC
  endDate: Date;
  outcomes: { name: string; probability: number }[];
  category: string;
  status: 'active' | 'resolved' | 'upcoming';
}

interface MarketListProps {
  markets: Market[];
  loading?: boolean;
}

const MarketList: React.FC<MarketListProps> = ({ markets, loading = false }) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('volume-desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(markets.map(market => market.category))];
  }, [markets]);

  // Filter and sort markets
  const filteredMarkets = useMemo(() => {
    let result = [...markets];
    
    // Apply filters
    if (categoryFilter !== 'all') {
      result = result.filter(market => market.category === categoryFilter);
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(market => market.status === statusFilter);
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(market => 
        market.title.toLowerCase().includes(query) ||
        market.category.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'volume-desc':
        return result.sort((a, b) => b.volume - a.volume);
      case 'volume-asc':
        return result.sort((a, b) => a.volume - b.volume);
      case 'endDate-asc':
        return result.sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
      case 'newest':
        return result.sort((a, b) => b.endDate.getTime() - a.endDate.getTime());
      default:
        return result;
    }
  }, [markets, categoryFilter, statusFilter, searchQuery, sortBy]);

  // Calculate time remaining percentage (for progress bar)
  const getTimeRemainingPercentage = (endDate: Date) => {
    const now = new Date();
    const endTime = endDate.getTime();
    const currentTime = now.getTime();
    const totalDuration = endTime - currentTime;
    
    if (totalDuration <= 0) return 100;
    
    const remainingPercentage = (totalDuration / (24 * 60 * 60 * 1000)) * 100;
    return Math.min(100, Math.max(0, remainingPercentage));
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="h-64">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-2 w-full rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredMarkets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No markets found</h3>
        <p className="text-gray-500">Try adjusting your filters or check back later</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input 
          placeholder="Search markets..." 
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          aria-label="Search prediction markets"
        />
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger aria-label="Filter by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger aria-label="Sort markets">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="volume-desc">Volume: High to Low</SelectItem>
            <SelectItem value="volume-asc">Volume: Low to High</SelectItem>
            <SelectItem value="endDate-asc">Ending Soonest</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Market Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMarkets.map(market => (
          <Card 
            key={market.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            aria-labelledby={`market-title-${market.id}`}
          >
            <CardHeader>
              <CardTitle id={`market-title-${market.id}`} className="text-lg">
                {market.title}
              </CardTitle>
              <div className="flex justify-between items-center">
                <Badge variant={market.status === 'active' ? 'default' : 'secondary'}>
                  {market.status}
                </Badge>
                <span className="text-sm text-gray-500">{market.category}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Volume</span>
                  <span className="font-semibold">{formatCurrency(market.volume)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Ends</span>
                  <span className="font-semibold">{formatDate(market.endDate)}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${getTimeRemainingPercentage(market.endDate)}%` }}
                    aria-label={`Time remaining: ${Math.round(getTimeRemainingPercentage(market.endDate))}%`}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                {market.outcomes.map((outcome, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{outcome.name}</span>
                    <span className="font-semibold">{(outcome.probability * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MarketList;
