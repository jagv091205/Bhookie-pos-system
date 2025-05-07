import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function MenuGrid({ onAddItem = () => {} }) {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [error, setError] = useState(null);
  const [sauceOptions, setSauces] = useState([]);
  const [showSaucePopup, setShowSaucePopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Clickable items - lowercased for comparison
  const clickableItems = [
    "chicken bites",
    "chicken drumsticks",
    "manchurian bites",
    "vada pav",
    "bhaji pav",
    "veggie aloo tikki burger",
    "chicken spicy burger",
    "chai"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categorySnap = await getDocs(collection(db, "category"));
        const categoryData = categorySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoryData);

        const itemsSnap = await getDocs(collection(db, "items"));
        const itemData = itemsSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            categoryId:
              data.categoryId?.id ||
              data.categoryId?.split("/").pop() ||
              null,
          };
        });
        setItems(itemData);
      } catch (err) {
        setError("Error loading menu data");
        console.error("Error loading menu data:", err);
      }
    };

    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => item.categoryId === selectedCategoryId);
  }, [items, selectedCategoryId]);

  const handleItemClick = async (item) => {
    setSelectedItem(item);
    try {
      if (item.sauces) {
        const sauceGroupSnap = await getDoc(item.sauces);
        if (sauceGroupSnap.exists()) {
          const sauceList = sauceGroupSnap.data().sauces || [];
          setSauces(sauceList);
          setShowSaucePopup(true);
          return; // Wait for sauce selection
        }
      }
      // If no sauces or error, add item directly
      onAddItem({
        id: item.id,
        name: item.itemName,
        price: item.price,
        quantity: 1
      });
    } catch (err) {
      console.error("Error fetching sauces:", err);
      // On error, add the item without sauces
      onAddItem({
        id: item.id,
        name: item.itemName,
        price: item.price,
        quantity: 1
      });
    }
  };

  const handleSelectSauce = (sauce) => {
    if (selectedItem) {
      onAddItem({
        id: selectedItem.id,
        name: selectedItem.itemName,
        price: selectedItem.price,
        sauces: sauce ? [sauce] : [],
        quantity: 1
      });
    }
    setShowSaucePopup(false);
    setSelectedItem(null);
  };

  return (
    <div className="flex flex-row w-full h-[calc(100vh-140px)] overflow-hidden">
      {/* Categories */}
      <div className="w-[180px] bg-purple-800 text-white p-2 flex flex-col gap-1 overflow-y-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
            className={`py-2 px-2 rounded text-left tracking-wide ${
              selectedCategoryId === cat.id
                ? "bg-white text-purple-800"
                : "bg-purple-700"
            } hover:bg-purple-600 transition`}
          >
            {cat.name?.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="flex-1 p-4 bg-purple-200 overflow-y-auto">
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : selectedCategoryId ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2">
            {filteredItems.map((item) => {
              const isClickable = clickableItems.includes(item.itemName.toLowerCase());

              return (
                <button
                  key={item.id}
                  onClick={isClickable ? () => handleItemClick(item) : undefined}
                  disabled={!isClickable}
                  className={`rounded p-1 shadow-md text-white text-center flex flex-col justify-center items-center transition ${
                    isClickable ? "" : "opacity-50 cursor-not-allowed"
                  }`}
                  style={{
                    backgroundColor:
                      item.itemName.toLowerCase().includes("chicken")
                        ? "#e60000"
                        : item.itemName.toLowerCase().includes("paneer")
                        ? "#1f3b73"
                        : "#22594c",
                  }}
                >
                  <div>{item.itemName.toUpperCase()}</div>
                  <div className="text-xl mt-3">£{item.price}</div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-800 font-medium text-lg">
            Select a category to view items
          </div>
        )}
      </div>

      {/* Sauce Popup */}
      {showSaucePopup && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-40">
          <div className="bg-white rounded-lg p-5 shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-5 text-purple-900">
              Select Sauce for {selectedItem.itemName}
            </h2>

            {sauceOptions.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {sauceOptions.map((sauce, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSauce(sauce)}
                    className="bg-green-300 hover:bg-green-300 text-black px-3 py-3 rounded text-sm"
                  >
                    {sauce}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-gray-300 mb-3">No sauces available</div>
            )}

            <button
              onClick={() => handleSelectSauce(null)}
              className="mt-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600"
            >
              No Sauce
            </button>

            <button
              onClick={() => {
                setShowSaucePopup(false);
                setSelectedItem(null);
              }}
              className="mt-2 ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
