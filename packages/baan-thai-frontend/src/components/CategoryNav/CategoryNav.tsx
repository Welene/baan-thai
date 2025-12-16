import './CategoryNav.css';

interface CategoryNavProps {
  categories: string[];
  categoryNames: { [key: string]: string };
  onCategoryClick: (categoryKey: string) => void;
}

export const CategoryNav = ({ categories, categoryNames, onCategoryClick }: CategoryNavProps) => {
  return (
    <nav className="category-nav">
      {categories.map((categoryKey) => (
        <button
          key={categoryKey}
          className="category-nav-button"
          onClick={() => onCategoryClick(categoryKey)}
        >
          {categoryNames[categoryKey] || categoryKey}
        </button>
      ))}
    </nav>
  );
};

export default CategoryNav;
//author: Tim
// Component for navigating between categories in the menu