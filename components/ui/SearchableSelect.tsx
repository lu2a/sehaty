'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Plus } from 'lucide-react';

interface Props {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  allowCustom?: boolean; // هل يسمح بكتابة قيمة غير موجودة؟
}

export default function SearchableSelect({ options, value, onChange, placeholder = 'اختر...', allowCustom = true }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        className="w-full p-3 border rounded-xl bg-white flex justify-between items-center cursor-pointer focus:ring-2 ring-blue-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <ChevronDown size={18} className="text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-60 overflow-hidden flex flex-col">
          {/* حقل البحث */}
          <div className="p-2 border-b bg-gray-50 flex items-center gap-2">
            <Search size={16} className="text-gray-400" />
            <input 
              autoFocus
              className="w-full bg-transparent outline-none text-sm"
              placeholder="بحث أو كتابة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && allowCustom && search) {
                  onChange(search);
                  setIsOpen(false);
                }
              }}
            />
          </div>

          {/* النتائج */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <div 
                  key={idx}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  {opt}
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-gray-400 text-sm">
                {allowCustom ? (
                  <button 
                    className="text-blue-600 flex items-center justify-center gap-1 w-full"
                    onClick={() => {
                      onChange(search);
                      setIsOpen(false);
                    }}
                  >
                    <Plus size={14} /> إضافة "{search}"
                  </button>
                ) : (
                  'لا توجد نتائج'
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
