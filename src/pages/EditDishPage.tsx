import { useParams } from 'react-router-dom';
import { useDish } from '../hooks/useDishes';
import DishForm from '../components/DishForm';

export default function EditDishPage() {
  const { id } = useParams<{ id: string }>();
  const dish = useDish(id ? parseInt(id) : undefined);

  if (!dish) {
    return <p className="text-center py-20 text-muted dark:text-muted-dark">Loading...</p>;
  }

  return <DishForm existing={dish} />;
}
