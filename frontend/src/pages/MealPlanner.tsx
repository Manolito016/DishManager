import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
    Plus, X, Search, ExternalLink, Clock, CalendarDays, Trash2, Layout, GripVertical,
    ChevronDown, ChevronRight
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

interface Dish {
    id: number;
    name: string;
    category: string;
    style: string;
}

interface WeeklyPlan {
    id: number;
    name: string;
}

const DAYS = [
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' },
    { id: 7, name: 'Sunday' },
];

const MealPlanner: React.FC = () => {
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);
    const [activePlanId, setActivePlanId] = useState<number | null>(null);
    const [activePlanData, setActivePlanData] = useState<Record<number, any>>({});
    const [isTemplatesOpen, setIsTemplatesOpen] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{dayId: number, mealType: 'lunch' | 'dinner', role: string} | null>(null);

    useEffect(() => {
        fetchDishes();
        fetchWeeklyPlans();
    }, []);

    useEffect(() => {
        if (activePlanId) {
            fetchActivePlanData();
        }
    }, [activePlanId]);

    const fetchDishes = async () => {
        try {
            const response = await api.get('/dishes');
            setDishes(response.data);
        } catch (error) {
            console.error('Error fetching dishes:', error);
        }
    };

    const fetchWeeklyPlans = async () => {
        try {
            const response = await api.get('/weekly-plans');
            setWeeklyPlans(response.data);
            if (response.data.length > 0 && !activePlanId) {
                setActivePlanId(response.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching weekly plans:', error);
        }
    };

    const fetchActivePlanData = async () => {
        if (!activePlanId) return;
        try {
            const response = await api.get(`/weekly-plans/${activePlanId}`);
            const plansMap: Record<number, any> = {};
            
            response.data.daily_plans.forEach((daily: any) => {
                const dayData: any = { lunch: {}, dinner: {} };
                daily.meals.forEach((meal: any) => {
                    const type = meal.type as 'lunch' | 'dinner';
                    meal.meal_dishes.forEach((md: any) => {
                        if (md.role === 'side_dish') {
                            if (!dayData[type][md.role]) dayData[type][md.role] = [];
                            dayData[type][md.role].push({ id: md.dish_id, name: md.dish?.name });
                        } else {
                            dayData[type][md.role] = { id: md.dish_id, name: md.dish?.name };
                        }
                    });
                });
                plansMap[daily.day_of_week] = dayData;
            });
            setActivePlanData(plansMap);
        } catch (error) {
            console.error('Error fetching plan data:', error);
        }
    };

    const handleCreateWeek = async () => {
        const name = prompt('Enter a name for the new week:', `Week ${weeklyPlans.length + 1}`);
        if (!name) return;
        
        try {
            const response = await api.post('/weekly-plans', { name });
            setWeeklyPlans([...weeklyPlans, response.data]);
            setActivePlanId(response.data.id);
        } catch (error) {
            console.error('Error creating week:', error);
        }
    };

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(weeklyPlans);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setWeeklyPlans(items);

        try {
            await api.post('/weekly-plans/reorder', {
                ids: items.map(plan => plan.id)
            });
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    const openSelector = (dayId: number, mealType: 'lunch' | 'dinner', role: string) => {
        setModalConfig({ dayId, mealType, role });
        setIsModalOpen(true);
    };

    const selectDish = async (dish: Dish) => {
        if (!modalConfig || !activePlanId) return;
        const { dayId, mealType, role } = modalConfig;

        const newPlans = { ...activePlanData };
        if (!newPlans[dayId]) newPlans[dayId] = { lunch: {}, dinner: {} };
        
        if (role === 'side_dish') {
            if (!newPlans[dayId][mealType][role]) newPlans[dayId][mealType][role] = [];
            if (!newPlans[dayId][mealType][role].find((d: any) => d.id === dish.id)) {
                newPlans[dayId][mealType][role].push({ id: dish.id, name: dish.name });
            }
        } else {
            newPlans[dayId][mealType][role] = { id: dish.id, name: dish.name };
        }

        setActivePlanData(newPlans);
        setIsModalOpen(false);
        saveDayPlan(dayId, newPlans[dayId]);
    };

    const removeDish = async (dayId: number, mealType: 'lunch' | 'dinner', role: string, dishId?: number) => {
        const newPlans = { ...activePlanData };
        if (role === 'side_dish') {
            newPlans[dayId][mealType][role] = newPlans[dayId][mealType][role].filter((d: any) => d.id !== dishId);
        } else {
            delete newPlans[dayId][mealType][role];
        }
        setActivePlanData(newPlans);
        saveDayPlan(dayId, newPlans[dayId]);
    };

    const saveDayPlan = async (dayId: number, dayData: any) => {
        if (!activePlanId) return;
        try {
            const prepareIds = (val: any) => {
                if (Array.isArray(val)) return val.map(v => v.id);
                return val ? val.id : null;
            };

            await api.post(`/weekly-plans/${activePlanId}/days/${dayId}`, {
                lunch: {
                    starter: prepareIds(dayData.lunch.starter),
                    main_dish: prepareIds(dayData.lunch.main_dish),
                    side_dish: prepareIds(dayData.lunch.side_dish),
                    dessert: prepareIds(dayData.lunch.dessert),
                },
                dinner: {
                    starter: prepareIds(dayData.dinner.starter),
                    main_dish: prepareIds(dayData.dinner.main_dish),
                    side_dish: prepareIds(dayData.dinner.side_dish),
                    dessert: prepareIds(dayData.dinner.dessert),
                }
            });
        } catch (error) {
            console.error('Error saving day plan:', error);
        }
    };

    const handleDeleteWeek = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this week template?')) return;
        try {
            await api.delete(`/weekly-plans/${id}`);
            const newWeeks = weeklyPlans.filter(w => w.id !== id);
            setWeeklyPlans(newWeeks);
            if (activePlanId === id) {
                setActivePlanId(newWeeks.length > 0 ? newWeeks[0].id : null);
                if (newWeeks.length === 0) setActivePlanData({});
            }
        } catch (error) {
            console.error('Error deleting week:', error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-gray-50">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <button 
                        onClick={() => setIsTemplatesOpen(!isTemplatesOpen)}
                        className="font-bold text-gray-800 flex items-center gap-2 hover:bg-gray-50 px-2 py-1 -ml-2 rounded-lg transition-colors group"
                    >
                        <span className="text-gray-400 group-hover:text-orange-500 transition-colors">
                            {isTemplatesOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </span>
                        <Clock className="text-orange-500" size={18} /> Templates
                    </button>
                    <button 
                        onClick={handleCreateWeek}
                        className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm transition-colors"
                        title="New Week Template"
                    >
                        <Plus size={16} />
                    </button>
                </div>
                {isTemplatesOpen && (
                    <div className="flex-1 overflow-y-auto p-4">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="weekly-plans">
                                {(provided) => (
                                    <div 
                                        {...provided.droppableProps} 
                                        ref={provided.innerRef}
                                        className="space-y-2"
                                    >
                                        {weeklyPlans.map((plan, index) => (
                                            <Draggable key={plan.id} draggableId={plan.id.toString()} index={index}>
                                                {(provided) => (
                                                    <div 
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        onClick={() => setActivePlanId(plan.id)}
                                                        className={`group w-full text-left px-4 py-3 rounded-xl transition-all cursor-pointer flex justify-between items-center ${
                                                            activePlanId === plan.id
                                                                ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                                                : 'hover:bg-gray-50 text-gray-600 border border-transparent'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <div {...provided.dragHandleProps} className="text-gray-300 hover:text-orange-400">
                                                                <GripVertical size={16} />
                                                            </div>
                                                            <div className="font-semibold truncate">{plan.name}</div>
                                                        </div>
                                                        <button 
                                                            onClick={(e) => handleDeleteWeek(plan.id, e)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                        {weeklyPlans.length === 0 && (
                            <div className="text-center py-10 text-gray-400 text-sm italic">
                                Create your first week template!
                            </div>
                        )}
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-6xl mx-auto">
                    {activePlanId ? (
                        <>
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                    <CalendarDays className="text-orange-500" /> 
                                    {weeklyPlans.find(w => w.id === activePlanId)?.name}
                                </h1>
                                <p className="text-gray-500">Weekly Meal Schedule Template</p>
                            </div>

                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 text-gray-500 uppercase text-[10px] font-bold tracking-widest">
                                            <th className="px-6 py-4 text-left border-b w-40">Day</th>
                                            <th className="px-6 py-4 text-left border-b border-l">Lunch</th>
                                            <th className="px-6 py-4 text-left border-b border-l">Dinner</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {DAYS.map(day => (
                                            <tr key={day.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-6 py-8 align-top">
                                                    <div className="text-lg font-black text-gray-800">{day.name}</div>
                                                </td>
                                                <td className="px-6 py-8 border-l align-top">
                                                    <MealSection 
                                                        dayId={day.id}
                                                        type="lunch"
                                                        data={activePlanData[day.id]?.lunch || {}}
                                                        onAdd={(role) => openSelector(day.id, 'lunch', role)}
                                                        onRemove={(role, id) => removeDish(day.id, 'lunch', role, id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-8 border-l align-top">
                                                    <MealSection 
                                                        dayId={day.id}
                                                        type="dinner"
                                                        data={activePlanData[day.id]?.dinner || {}}
                                                        onAdd={(role) => openSelector(day.id, 'dinner', role)}
                                                        onRemove={(role, id) => removeDish(day.id, 'dinner', role, id)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                            <Layout size={64} className="opacity-20" />
                            <p className="text-xl font-medium">Select or create a week template to start planning</p>
                            <button 
                                onClick={handleCreateWeek}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl shadow-lg transition-transform active:scale-95"
                            >
                                + Create New Week
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {isModalOpen && (
                <DishSelectorModal 
                    dishes={dishes} 
                    onSelect={selectDish} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </div>
    );
};

const MealSection: React.FC<{
    dayId: number,
    type: 'lunch' | 'dinner',
    data: any,
    onAdd: (role: string) => void,
    onRemove: (role: string, id?: number) => void
}> = ({ data, onAdd, onRemove }) => {
    return (
        <div className="space-y-6">
            <MealRow label="Starter" role="starter" item={data.starter} onAdd={onAdd} onRemove={onRemove} />
            <div className="bg-orange-50/40 p-4 rounded-2xl border border-orange-100/50">
                <div className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-3">Main Course</div>
                <div className="space-y-4">
                    <MealRow label="Main Dish" role="main_dish" item={data.main_dish} onAdd={onAdd} onRemove={onRemove} />
                    <div className="pl-4 border-l-2 border-orange-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Side Dish(es)</span>
                            <button onClick={() => onAdd('side_dish')} className="p-1 text-orange-500 hover:bg-orange-100 rounded-full transition-colors">
                                <Plus size={14} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {data.side_dish?.map((sd: any) => (
                                <div key={sd.id} className="group relative bg-white px-3 py-1.5 rounded-xl border border-orange-200/50 text-xs flex items-center gap-2 shadow-sm">
                                    <Link to={`/dish/${sd.id}`} className="hover:text-orange-500 font-medium truncate max-w-[120px]">{sd.name}</Link>
                                    <button onClick={() => onRemove('side_dish', sd.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            {(!data.side_dish || data.side_dish.length === 0) && (
                                <span className="text-[10px] text-gray-300 italic">No sides added</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <MealRow label="Dessert" role="dessert" item={data.dessert} onAdd={onAdd} onRemove={onRemove} />
        </div>
    );
};

const MealRow: React.FC<{
    label: string,
    role: string,
    item: any,
    onAdd: (role: string) => void,
    onRemove: (role: string) => void
}> = ({ label, role, item, onAdd, onRemove }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
                {!item && (
                    <button onClick={() => onAdd(role)} className="p-1 text-orange-500 hover:bg-orange-50 rounded-full transition-colors">
                        <Plus size={16} />
                    </button>
                )}
            </div>
            {item ? (
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm group">
                    <Link to={`/dish/${item.id}`} className="text-sm font-bold text-gray-700 hover:text-orange-500 flex items-center gap-2 truncate">
                        {item.name} <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <button onClick={() => onRemove(role)} className="text-gray-300 hover:text-red-500 p-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <div className="text-[10px] text-gray-300 italic px-3 font-medium">Empty</div>
            )}
        </div>
    );
};

const DishSelectorModal: React.FC<{
    dishes: Dish[],
    onSelect: (dish: Dish) => void,
    onClose: () => void
}> = ({ dishes, onSelect, onClose }) => {
    const [search, setSearch] = useState('');
    const filtered = dishes.filter(d => 
        d.name.toLowerCase().includes(search.toLowerCase()) || 
        d.category?.toLowerCase().includes(search.toLowerCase()) ||
        d.style?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-2xl font-black text-gray-800">Choose Dish</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-2xl transition-colors">
                        <X size={28} />
                    </button>
                </div>
                <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Search your library..." 
                            className="w-full pl-12 pr-6 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-inner focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-4 space-y-2">
                    {filtered.map(dish => (
                        <button 
                            key={dish.id} 
                            onClick={() => onSelect(dish)}
                            className="w-full text-left p-4 hover:bg-orange-50 rounded-[1.25rem] transition-all flex justify-between items-center group border border-transparent hover:border-orange-200"
                        >
                            <div className="flex-1 min-w-0 pr-4">
                                <div className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors truncate">{dish.name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">{dish.category || 'Any Type'}</span>
                                    {dish.style && (
                                        <>
                                            <span className="text-gray-300 text-[10px]">•</span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{dish.style}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="p-2 bg-gray-50 group-hover:bg-orange-100 rounded-xl transition-colors shrink-0">
                                <Plus size={20} className="text-gray-300 group-hover:text-orange-600" />
                            </div>
                        </button>
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-gray-400 italic">No dishes match your search</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MealPlanner;
