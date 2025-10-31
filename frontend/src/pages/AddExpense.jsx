import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DEFAULT_CATEGORIES = ["Food", "Travel", "Shopping", "Others"];
const LS_KEY = "expense_categories_v1";

const AddExpense = () => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [otherInput, setOtherInput] = useState("");
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          const merged = Array.from(new Set([...parsed, ...DEFAULT_CATEGORIES]));
          setCategories(merged);
          if (!merged.includes(category)) setCategory(merged[0]);
        }
      }
    } catch (err) {
      console.warn("Failed to load categories:", err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(categories));
    } catch (err) {
      console.warn("Failed to save categories:", err);
    }
  }, [categories]);

  const handleAddCustomCategory = () => {
    const trimmed = otherInput.trim();
    if (!trimmed) return;
    const exists = categories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      const withoutOthers = categories.filter((c) => c !== "Others");
      const newList = [...withoutOthers, trimmed, "Others"];
      setCategories(newList);
    }
    setCategory(trimmed);
    setOtherInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!title.trim()) {
      setMessage("❌ Please enter a title.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setMessage("❌ Please enter a valid amount.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, amount: Number(amount), category, date }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

      setMessage("✅ Expense added successfully!");
      setTimeout(() => navigate("/dashboard"), 600);
    } catch (err) {
      console.error("Add failed:", err);
      setMessage("❌ " + (err.message || "Network error"));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
          Add Expense
        </h2>

        {message && (
          <p className="text-center mb-3 text-sm text-blue-600">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            className="w-full p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Amount (¥)"
            className="w-full p-2 border rounded"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <div>
            <select
              className="w-full p-2 border rounded"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {category === "Others" && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Enter custom category to add to the list:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Entertainment, Rent, Medical..."
                  className="flex-1 p-2 border rounded"
                  value={otherInput}
                  onChange={(e) => setOtherInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddCustomCategory}
                  className="px-3 py-2 bg-blue-600 text-white rounded"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-400">
                After adding, your new category will be selected automatically.
              </p>
            </div>
          )}

          <input
            type="date"
            className="w-full p-2 border rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <button className="w-full bg-[#6F4E37] text-white p-2 rounded">
            Add Expense
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
