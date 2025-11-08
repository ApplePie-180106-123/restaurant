// src/components/FilterSort.jsx
import React from "react";

const FilterSort = ({ q, onQChange, categories = [], category, onCategoryChange, sort, onSortChange, showAvailableOnly, onAvailableToggle }) => {
    return (
        <div className="w-full mb-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="flex-1">
                    <input
                        value={q}
                        onChange={e => onQChange(e.target.value)}
                        placeholder="Search dishes..."
                        className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                </div>

                <div>
                    <select value={category || ""} onChange={e => onCategoryChange(e.target.value)} className="border rounded-md py-2 px-3">
                        <option value="">All categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div>
                    <select value={sort || ""} onChange={e => onSortChange(e.target.value)} className="border rounded-md py-2 px-3">
                        <option value="">Sort</option>
                        <option value="price_asc">Price: Low → High</option>
                        <option value="price_desc">Price: High → Low</option>
                        <option value="name_asc">Name A → Z</option>
                        <option value="name_desc">Name Z → A</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <input id="avail" type="checkbox" checked={showAvailableOnly} onChange={e => onAvailableToggle(e.target.checked)} />
                    <label htmlFor="avail" className="text-sm">Available only</label>
                </div>
            </div>
        </div>
    );
};

export default FilterSort;
