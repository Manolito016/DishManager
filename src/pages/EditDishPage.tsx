import { useParams } from 'react-router-dom';
import { useDish } from '../hooks/useDishes';
import DishForm from '../components/DishForm';

export default function EditDishPage() {
  const { id } = useParams<{ id: string }>();
  const dish = useDish(id ? parseInt(id) : undefined);

  if (!dish) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="skeleton h-8 w-48 mb-6 text-muted" />
        <div className="bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark p-4 sm:p-6 space-y-5">
          <div className="skeleton h-10 w-full rounded-xl text-muted" />
          <div className="skeleton h-20 w-full rounded-xl text-muted" />
          <div className="skeleton h-10 w-full rounded-xl text-muted" />
          <div className="skeleton h-10 w-full rounded-xl text-muted" />
          <div className="skeleton h-10 w-full rounded-xl text-muted" />
        </div>
      </div>
    );
  }

  return <DishForm existing={dish} />;
}
