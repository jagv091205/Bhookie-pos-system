import { useEffect, useState } from "react";
import { collection, getDocs, doc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function MenuGrid({ onAddItem = () => {} }) {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categorySnap = await getDocs(collection(db, "category"));
        const categoryData = categorySnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoryData);

        // Fetch items and rehydrate categoryId reference
        const itemsSnap = await getDocs(collection(db, "items"));
        const itemData = itemsSnap.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            categoryId: data.categoryId?.id
              ? doc(db, "category", data.categoryId.id)
              : null,
          };
        });
        setItems(itemData);
      } catch (err) {
        console.error("Error loading menu data:", err);
      }
    };

    fetchData();
  }, []);

  const getItemsForSelectedCategory = () => {
    if (!selectedCategory) return [];
  
    return items.filter(item =>
      item.categoryId?.id === selectedCategory.id
    );
  };
  

  return (
    <div className="flex h-full w-full">
      {/* Left panel: categories */}
      <div className="w-1/3 p-4 border-r overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="flex flex-col gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className={`p-2 rounded text-left hover:bg-gray-200 ${
                selectedCategory?.id === cat.id
                  ? "bg-gray-300 font-semibold"
                  : "bg-gray-100"
              }`}
            >
              {cat.categoryName}
            </button>
          ))}
        </div>
      </div>

      {/* Right panel: items */}
      <div className="w-2/3 p-4 overflow-y-auto">
        {selectedCategory ? (
          <>
            <h2 className="text-xl font-semibold mb-4">
              {selectedCategory.categoryName} Items
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {getItemsForSelectedCategory().map(item => (
                <button
                  key={item.id}
                  onClick={() => onAddItem(item)}
                  className="bg-gray-100 hover:bg-gray-200 p-3 rounded shadow-sm text-left"
                >
                  <div className="font-medium">{item.itemName}</div>
                  <div className="text-sm text-gray-600">₹{item.price}</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-500">Select a category to see items</p>
        )}
      </div>
    </div>
  );
}
