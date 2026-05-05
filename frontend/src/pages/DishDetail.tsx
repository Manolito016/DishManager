import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Edit, Trash2, Video, List } from 'lucide-react';

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

const DishDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [dish, setDish] = useState<Dish | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDish();
    }, [id]);

    const fetchDish = async () => {
        try {
            const response = await api.get(`/dishes/${id}`);
            setDish(response.data);
        } catch (error) {
            console.error('Error fetching dish:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteDish = async () => {
        if (window.confirm('Are you sure you want to delete this dish?')) {
            try {
                await api.delete(`/dishes/${id}`);
                navigate('/dishes');
            } catch (error) {
                console.error('Error deleting dish:', error);
            }
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
    if (!dish) return <div className="text-center py-20 text-red-500">Dish not found</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <Link to="/dishes" className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors">
                    <ArrowLeft size={20} /> Back to Dishes
                </Link>
                <div className="flex gap-2">
                    <Link to={`/edit/${dish.id}`} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                        <Edit size={20} />
                    </Link>
                    <button onClick={deleteDish} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="relative h-64 md:h-96">
                    {dish.photo_url ? (
                        <img src={dish.photo_url} alt={dish.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                            No Image
                        </div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                            {dish.category || 'Any Type'}
                        </span>
                        {dish.style && (
                            <span className="bg-gray-800/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                                {dish.style}
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-6 md:p-10">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">{dish.name}</h1>
                    
                    {dish.notes && (
                        <div className="mb-8">
                            <p className="text-gray-600 leading-relaxed italic border-l-4 border-orange-200 pl-4">
                                {dish.notes}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <h3 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                                <List className="text-orange-500" size={24} /> Ingredients
                            </h3>
                            <ul className="space-y-3">
                                {dish.ingredients.map((ing, index) => (
                                    <li key={index} className="flex justify-between items-center p-2 rounded-lg hover:bg-orange-50 transition-colors">
                                        <span className="text-gray-700 font-medium">{ing.name}</span>
                                        <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-sm">
                                            {ing.amount} {ing.unit}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                                <Video className="text-orange-500" size={24} /> Video Tutorial
                            </h3>
                            {dish.video_url ? (
                                <div className="aspect-video rounded-xl overflow-hidden shadow-md bg-black">
                                    <video
                                        className="w-full h-full"
                                        src={dish.video_url}
                                        controls
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 border-2 border-dashed border-gray-200">
                                    No video tutorial uploaded
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DishDetail;
