import { Search, Filter } from 'lucide-react';
import { CATEGORIES } from '../types';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
}

export default function SearchBar({ search, onSearchChange, category, onCategoryChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex-1 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-muted-dark" />
        <input
          type="text"
          placeholder="Search dishes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark placeholder:text-muted dark:placeholder:text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
        />
      </div>
      <div className="relative">
        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-muted-dark pointer-events-none" />
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="pl-9 pr-8 py-2.5 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 cursor-pointer appearance-none"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
