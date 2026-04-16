import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Filter, X } from 'lucide-react';

interface AdvancedFiltersProps {
  isOpen: boolean;
  onToggle: () => void;
  filters: {
    category: string;
    language: string;
    serverCount: [number];
    permissions: string[];
    featured: boolean;
  };
  onFiltersChange: (filters: any) => void;
  categories: Array<{ id: string; name: string; color: string }>;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
];

const PERMISSIONS = [
  'Administrator',
  'Manage Server',
  'Manage Channels',
  'Manage Messages',
  'Send Messages',
  'Read Messages',
  'Voice Connect',
  'Voice Speak',
  'Manage Roles',
  'Kick Members',
  'Ban Members',
];

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  isOpen,
  onToggle,
  filters,
  onFiltersChange,
  categories,
}) => {
  const clearFilters = () => {
    onFiltersChange({
      category: 'all',
      language: 'all',
      serverCount: [0],
      permissions: [],
      featured: false,
    });
  };

  const hasActiveFilters = (filters.category && filters.category !== 'all') || 
    (filters.language && filters.language !== 'all') || filters.serverCount[0] > 0 || 
    filters.permissions.length > 0 || filters.featured;

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={onToggle}
        className="gap-2"
      >
        <Filter className="h-4 w-4" />
        Advanced Filters
        {hasActiveFilters && (
          <span className="ml-1 bg-primary text-primary-foreground rounded-full text-xs px-2 py-0.5">
            {[
              filters.category && filters.category !== 'all' ? 1 : 0,
              filters.language && filters.language !== 'all' ? 1 : 0, 
              filters.serverCount[0] > 0 ? 1 : 0, 
              filters.permissions.length,
              filters.featured ? 1 : 0
            ].reduce((sum, count) => sum + count, 0)}
          </span>
        )}
      </Button>
    );
  }

  return (
    <Card className="mb-6 animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Filter by Tags</CardTitle>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={filters.category} onValueChange={(value) => 
              onFiltersChange({ ...filters, category: value })
            }>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Language</label>
            <Select value={filters.language} onValueChange={(value) => 
              onFiltersChange({ ...filters, language: value })
            }>
              <SelectTrigger>
                <SelectValue placeholder="All languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All languages</SelectItem>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Featured Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Special</label>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="featured"
                checked={filters.featured}
                onCheckedChange={(checked) => 
                  onFiltersChange({ ...filters, featured: !!checked })
                }
              />
              <label htmlFor="featured" className="text-sm">Featured only</label>
            </div>
          </div>

          {/* Server Count Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Min. Server Count: {filters.serverCount[0].toLocaleString()}
            </label>
            <Slider
              value={filters.serverCount}
              onValueChange={(value) => 
                onFiltersChange({ ...filters, serverCount: value })
              }
              max={100000}
              step={1000}
              className="w-full"
            />
          </div>
        </div>

        {/* Permissions Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Required Permissions</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {PERMISSIONS.map((permission) => (
              <div key={permission} className="flex items-center space-x-2">
                <Checkbox 
                  id={permission}
                  checked={filters.permissions.includes(permission)}
                  onCheckedChange={(checked) => {
                    const newPermissions = checked
                      ? [...filters.permissions, permission]
                      : filters.permissions.filter(p => p !== permission);
                    onFiltersChange({ ...filters, permissions: newPermissions });
                  }}
                />
                <label htmlFor={permission} className="text-sm">
                  {permission}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};