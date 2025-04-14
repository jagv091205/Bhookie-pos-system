import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function MenuGrid({ onAddItem = () => {} }) {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [error, setError] = useState(null);
  const [sauces, setSauces] = useState([]);
  const [showSaucePopup, setShowSaucePopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

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
      const saucesSnap = await getDocs(collection(db, `items/${item.id}/sauces`));
      const sauceList = saucesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSauces(sauceList);
      setShowSaucePopup(true);
    } catch (err) {
      console.error("Error fetching sauces: ", err);
      setSauces([]);
    }
  };

  const handleSelectSauce = (item, sauce) => {
    onAddItem({ ...item, selectedSauce: sauce });
    setShowSaucePopup(false);
    setSelectedItem(null);
  };

  return (
    <div className="flex w-full h-[calc(100vh-260px)]">
      {/* Left: Categories */}
      <div className="w-[200px] bg-purple-800 text-white p-2 flex flex-col gap-3 overflow-y-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
            className={`py-4 px-4 rounded text-left tracking-wide ${
              selectedCategoryId === cat.id
                ? "bg-white text-purple-800"
                : "bg-purple-700"
            } hover:bg-purple-600 transition`}
          >
            {cat.name?.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Right: Items */}
      <div className="flex-1 p-6 bg-purple-100 overflow-y-auto">
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : selectedCategoryId ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-full overflow-y-auto">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="rounded p-2 shadow-md text-white text-center flex flex-col justify-center items-center word-break"
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
                <div className="text-xl mt-2">£{item.price}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 font-medium text-lg">
            Select a category to view items
          </div>
        )}
      </div>

      {/* Sauce Popup */}
      {showSaucePopup && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4 text-purple-800">
              Select Sauce for {selectedItem.itemName}
            </h2>
            <div className="flex flex-wrap gap-3">
              {sauces.length > 0 ? (
                sauces.map((sauce) => (
                  <button
                    key={sauce.id}
                    onClick={() => handleSelectSauce(selectedItem, sauce)}
                    className="bg-green-300 hover:bg-green-400 text-black px-4 py-2 rounded text-sm"
                  >
                    {sauce.Name} - £{sauce.price}
                  </button>
                ))
              ) : (
                <div className="text-gray-500">No sauces available</div>
              )}
            </div>
            <button
              onClick={() => {
                setShowSaucePopup(false);
                setSelectedItem(null);
              }}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
