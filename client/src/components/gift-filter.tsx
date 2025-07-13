import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";

interface GiftFilterProps {
  categories: string[];
  onFilterChange: (filter: { query: string; category: string }) => void;
}

export function GiftFilter({ categories, onFilterChange }: GiftFilterProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onFilterChange({ query: newQuery, category: selectedCategory });
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    onFilterChange({ query, category });
  };

  return (
    <div className="mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar regalo..."
          className="w-full pl-10 pr-4 py-2 border border-soft-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-safari-green-500 focus:border-safari-green-500"
          value={query}
          onChange={handleQueryChange}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-soft-gray-500 h-5 w-5" />
      </div>

      <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-thin">
        <Button
          variant={selectedCategory === "all" ? "filter-active" : "filter"}
          className="whitespace-nowrap px-3 py-1.5 text-sm rounded-full"
          onClick={() => handleCategoryClick("all")}
        >
          Todos
        </Button>

        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "filter-active" : "filter"}
            className="whitespace-nowrap px-3 py-1.5 text-sm rounded-full"
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
