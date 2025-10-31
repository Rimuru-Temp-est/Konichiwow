import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoadingOverlay from "../components/LoadingOverlay";

const parseDateInput = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return d.toISOString().slice(0, 10);
};

const Dashboard = () => {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);    
  const [deleting, setDeleting] = useState(false);   
  const [saving, setSaving] = useState(false);      
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_URL}/expenses?page=${page}&limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
        setExpenses(data.expenses || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Failed to fetch expenses:", err);
        setError(err.message || "Failed to fetch expenses");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchExpenses();
    else setLoading(false);
  }, [token, API_URL, page]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this expense?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete: " + (err.message || ""));
    } finally {
      setDeleting(false);
    }
  };

  const startEdit = (expense) => {
    setEditing({
      ...expense,
      date: parseDateInput(expense.date),
    });
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        title: editing.title,
        amount: Number(editing.amount),
        category: editing.category,
        date: editing.date,
      };
      const res = await fetch(`${API_URL}/expenses/${editing._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      setExpenses((prev) =>
        prev.map((exp) => (exp._id === editing._id ? data.expense : exp))
      );
      setEditing(null);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update: " + (err.message || ""));
    } finally {
      setSaving(false);
    }
  };

  const overlayText = saving ? "Saving changes..." : deleting ? "Deleting..." : "Loading expenses...";

  return (
    <>
      <LoadingOverlay show={loading || saving || deleting} text={overlayText} />

      <div className="flex flex-col items-center justify-start min-h-[80vh] px-4 py-8">
        <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-3xl font-semibold mb-4 text-gray-800">Dashboard</h2>

          {loading && <p className="text-gray-600">Loading expenses...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && expenses.length === 0 && (
            <p className="text-center text-gray-500 italic">
              No expenses found. Start adding your first one!
            </p>
          )}

          {!loading && expenses.length > 0 && (
            <>
              <ul className="space-y-3">
                {expenses.map((exp) => (
                  <li
                    key={exp._id}
                    className="bg-blue-50 border border-blue-100 shadow-sm p-4 rounded-xl flex justify-between items-start"
                  >
                    <div>
                      <p className="font-semibold text-lg text-gray-800">{exp.title}</p>
                      <p className="text-gray-600 text-sm mt-1">Category: {exp.category}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(exp.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <p className="text-blue-600 font-bold text-lg">¥{exp.amount}</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(exp)}
                          className="px-3 py-1 bg-[#967969] rounded text-sm"
                          disabled={saving || deleting}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(exp._id)}
                          className="px-3 py-1 bg-[#CB6D51] text-white rounded text-sm"
                          disabled={saving || deleting}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center mt-6">
                <div>
                  <p className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    className="px-3 py-1 rounded border"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading || saving || deleting}
                  >
                    Prev
                  </button>
                  <button
                    className="px-3 py-1 rounded border"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading || saving || deleting}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {editing && (
          <div className="w-full max-w-2xl mt-6 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-3">Edit Expense</h3>
            <form onSubmit={submitEdit} className="space-y-3">
              <input
                className="w-full p-2 border rounded"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                required
                disabled={saving || deleting}
              />
              <input
                className="w-full p-2 border rounded"
                type="number"
                value={editing.amount}
                onChange={(e) => setEditing({ ...editing, amount: e.target.value })}
                required
                disabled={saving || deleting}
              />
              <select
                className="w-full p-2 border rounded"
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                disabled={saving || deleting}
              >
                <option>Food</option>
                <option>Travel</option>
                <option>Shopping</option>
                <option>Others</option>
              </select>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={editing.date}
                onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                required
                disabled={saving || deleting}
              />
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={saving || deleting}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 border rounded"
                  disabled={saving || deleting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
