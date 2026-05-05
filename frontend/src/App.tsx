import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DishList from './pages/DishList';
import DishDetail from './pages/DishDetail';
import DishForm from './pages/DishForm';
import MealPlanner from './pages/MealPlanner';

const App: React.FC = () => {
    return (
        <Router>
            <div className="min-height-screen bg-gray-50">
                <nav className="bg-white shadow-sm border-b border-gray-100">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex justify-between items-center">
                            <a href="/" className="text-2xl font-bold text-orange-500">DishManager</a>
                            <div className="flex gap-6 items-center">
                                <a href="/" className="text-gray-600 hover:text-orange-500 font-medium">Meal Planner</a>
                                <a href="/dishes" className="text-gray-600 hover:text-orange-500 font-medium">Dishes</a>
                                <div className="text-sm text-gray-500 font-medium border-l pl-6">Personal Cooking System</div>
                            </div>
                        </div>
                    </div>
                </nav>

                <main>
                    <Routes>
                        <Route path="/" element={<MealPlanner />} />
                        <Route path="/dishes" element={<DishList />} />
                        <Route path="/dish/:id" element={<DishDetail />} />
                        <Route path="/add" element={<DishForm />} />
                        <Route path="/edit/:id" element={<DishForm />} />
                    </Routes>
                </main>

                <footer className="mt-20 py-10 border-t border-gray-200">
                    <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} Dish Manager - Your Personal Recipe Collection
                    </div>
                </footer>
            </div>
        </Router>
    );
};

export default App;
