import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Film, Upload } from 'lucide-react';

interface Ingredient {
    name: string;
    amount: string;
    unit: string;
}

interface DishFormState {
    name: string;
    category: string;
    style: string;
    notes: string;
    ingredients: Ingredient[];
}

const DishForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;
    const photoInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<DishFormState>({
        name: '',
        category: '',
        style: '',
        notes: '',
        ingredients: [{ name: '', amount: '', unit: '' }]
    });

    const [isOtherCategory, setIsOtherCategory] = useState(false);
    const [customCategory, setCustomCategory] = useState('');
    const PREDEFINED_CATEGORIES = ['Starter Dish', 'Main Dish', 'Side Dish', 'Dessert'];

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(isEdit);

    useEffect(() => {
        if (isEdit) {
            fetchDish();
        }
    }, [id]);

    const fetchDish = async () => {
        try {
            const response = await api.get(`/dishes/${id}`);
            const dish = response.data;
            
            setFormData({
                name: dish.name || '',
                category: dish.category || '',
                style: dish.style || '',
                notes: dish.notes || '',
                ingredients: dish.ingredients.length > 0 ? dish.ingredients : [{ name: '', amount: '', unit: '' }]
            });

            setCurrentPhotoUrl(dish.photo_url || null);
            setCurrentVideoUrl(dish.video_url || null);
        } catch (error) {
            console.error('Error fetching dish:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index][field] = value;
        setFormData({ ...formData, ingredients: newIngredients });
    };

    const addIngredient = () => {
        setFormData({
            ...formData,
            ingredients: [...formData.ingredients, { name: '', amount: '', unit: '' }]
        });
    };

    const removeIngredient = (index: number) => {
        const newIngredients = formData.ingredients.filter((_, i) => i !== index);
        setFormData({ ...formData, ingredients: newIngredients });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setVideoFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const cleanedIngredients = formData.ingredients.filter(ing => ing.name.trim() !== '');
            
            const data = new FormData();
            data.append('name', formData.name);
            data.append('category', formData.category);
            data.append('style', formData.style);
            data.append('notes', formData.notes);
            data.append('ingredients', JSON.stringify(cleanedIngredients));
            
            if (photoFile) {
                data.append('photo', photoFile);
            }
            if (videoFile) {
                data.append('video', videoFile);
            }

            if (isEdit) {
                data.append('_method', 'PUT');
                await api.post(`/dishes/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/dishes', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            navigate('/dishes');
        } catch (error) {
            console.error('Error saving dish:', error);
            alert('Failed to save dish. Please check your data.');
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="mb-6">
                <Link to="/dishes" className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors w-fit">
                    <ArrowLeft size={20} /> Back to Dishes
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-8">{isEdit ? 'Edit Dish' : 'Add New Dish'}</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Dish Name *</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            placeholder="e.g. Grandma's Apple Pie"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Dish Type</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="">Select a type</option>
                                {PREDEFINED_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Cuisine / Style</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                placeholder="e.g. French, Italian, Spicy"
                                value={formData.style}
                                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                <ImageIcon size={16} /> Dish Photo (Local)
                            </label>
                            <div 
                                onClick={() => photoInputRef.current?.click()}
                                className="w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-orange-500 cursor-pointer flex items-center justify-center gap-2 text-gray-500 hover:text-orange-500 transition-colors"
                            >
                                <Upload size={18} />
                                <span className="text-sm truncate">
                                    {photoFile ? photoFile.name : (currentPhotoUrl ? 'Change Photo' : 'Upload Photo')}
                                </span>
                            </div>
                            <input
                                type="file"
                                ref={photoInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                <Film size={16} /> Video Tutorial (Local)
                            </label>
                            <div 
                                onClick={() => videoInputRef.current?.click()}
                                className="w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-orange-500 cursor-pointer flex items-center justify-center gap-2 text-gray-500 hover:text-orange-500 transition-colors"
                            >
                                <Upload size={18} />
                                <span className="text-sm truncate">
                                    {videoFile ? videoFile.name : (currentVideoUrl ? 'Change Video' : 'Upload Video')}
                                </span>
                            </div>
                            <input
                                type="file"
                                ref={videoInputRef}
                                className="hidden"
                                accept="video/*"
                                onChange={handleVideoChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                        <textarea
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none h-32"
                            placeholder="Tell the story of this dish or add special instructions..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        ></textarea>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Ingredients</h3>
                        <button
                            type="button"
                            onClick={addIngredient}
                            className="text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-1"
                        >
                            <Plus size={20} /> Add
                        </button>
                    </div>

                    <div className="space-y-3">
                        {formData.ingredients.map((ing, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Ingredient name"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                        value={ing.name}
                                        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                                    />
                                </div>
                                <div className="w-24">
                                    <input
                                        type="text"
                                        placeholder="Amount"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                        value={ing.amount}
                                        onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                                    />
                                </div>
                                <div className="w-24">
                                    <input
                                        type="text"
                                        placeholder="Unit"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                        value={ing.unit}
                                        onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                                    />
                                </div>
                                {formData.ingredients.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeIngredient(index)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                    <Save size={24} /> {isEdit ? 'Update Recipe' : 'Save Recipe'}
                </button>
            </form>
        </div>
    );
};

export default DishForm;
