import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Plus, Search, Filter } from 'lucide-react';

interface Ingredient {
    id: number;
    name: string;
    amount: string;
    unit: string;
}

interface Dish {
    id: number;
    name: string;
    category: string;
    style: string;
    photo_url: string;
    video_url: string;
    notes: string;
    ingredients: Ingredient[];
}

const DishList: React.FC = () => {
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        fetchDishes();
    }, []);

    const fetchDishes = async () => {
        try {
            const response = await api.get('/dishes');
            setDishes(response.data);
        } catch (error) {
            console.error('Error fetching dishes:', error);
        }
    };

    const categories = Array.from(new Set(dishes.map(d => d.category).filter(Boolean)));

    const filteredDishes = dishes.filter(dish => {
        const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            dish.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === '' || dish.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Dishes</h1>
                <Link to="/add" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <Plus size={20} /> Add Dish
                </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search dishes..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <select
                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none appearance-none bg-white"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDishes.map(dish => (
                    <Link key={dish.id} to={`/dish/${dish.id}`} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
                        <div className="h-48 overflow-hidden">
                            {dish.photo_url ? (
                                <img src={dish.photo_url} alt={dish.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <div className="flex gap-2 mb-1">
                                <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded uppercase tracking-wider">
                                    {dish.category || 'Any Type'}
                                </span>
                                {dish.style && (
                                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase tracking-wider">
                                        {dish.style}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">{dish.name}</h2>
                            <p className="text-gray-600 text-sm mt-2 line-clamp-2">{dish.notes}</p>
                            <div className="mt-4 flex items-center text-sm text-gray-500">
                                <span>{dish.ingredients.length} Ingredients</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            
            {filteredDishes.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No dishes found. Try a different search or add a new one!</p>
                </div>
            )}
        </div>
    );
};

export default DishList;
