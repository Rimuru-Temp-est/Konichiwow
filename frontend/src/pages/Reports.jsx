import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const formatDate = (d) => {
  if (!d) return "";
  try {
    const dt = new Date(d);
    if (isNaN(dt)) return String(d);
    return dt.toLocaleDateString();
  } catch {
    return String(d);
  }
};

const normalizeExpense = (raw) => {
  return {
    id: raw._id || raw.id || raw._doc?._id || null,
    title: raw.title ?? raw.name ?? "(untitled)",
    amount: Number(raw.amount ?? raw.amt ?? raw.value ?? 0) || 0,
    category: raw.category ?? raw.cat ?? "Others",
    date: raw.date ?? raw.createdAt ?? raw._doc?.date ?? raw._doc?.createdAt ?? null,
    raw,
  };
};

const Reports = () => {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [mode, setMode] = useState("monthly");

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [category, setCategory] = useState("Food");

  const today = new Date();
  const isoToday = today.toISOString().slice(0, 10);
  const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
    .toISOString()
    .slice(0, 10);
  const [start, setStart] = useState(oneMonthAgo);
  const [end, setEnd] = useState(isoToday);
  const [sort, setSort] = useState("desc");

  const [loading, setLoading] = useState(false);
  const [reportAgg, setReportAgg] = useState(null);
  const [items, setItems] = useState([]); 
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  const monthStartEnd = (m, y) => {
    const s = new Date(y, m - 1, 1);
    const e = new Date(y, m, 0, 23, 59, 59, 999);
    const pad = (n) => String(n).padStart(2, "0");
    const sISO = `${s.getFullYear()}-${pad(s.getMonth() + 1)}-${pad(s.getDate())}`;
    const eISO = `${e.getFullYear()}-${pad(e.getMonth() + 1)}-${pad(e.getDate())}`;
    return { sISO, eISO };
  };

  const fetchMonthly = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    setReportAgg(null);
    setItems([]);
    setTotal(0);

    try {
      const aggRes = await fetch(`${API_URL}/reports/monthly?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const aggData = await aggRes.json();
      if (!aggRes.ok) throw new Error(aggData.message || `HTTP ${aggRes.status}`);
      setReportAgg(aggData || { total: 0, categories: {} });

      const { sISO, eISO } = monthStartEnd(month, year);
      const listRes = await fetch(`${API_URL}/expenses?start=${encodeURIComponent(sISO)}&end=${encodeURIComponent(eISO)}&sort=desc`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const listJson = await listRes.json();
      if (!listRes.ok) throw new Error(listJson.message || `HTTP ${listRes.status}`);

      let rawList = [];
      if (Array.isArray(listJson)) rawList = listJson;
      else if (Array.isArray(listJson.expenses)) rawList = listJson.expenses;
      else rawList = listJson.expenses ?? [];

      const normalized = rawList.map(normalizeExpense);
      setItems(normalized);

      const aggTotal = Number((aggData && aggData.total) || 0);
      if (aggTotal > 0) setTotal(aggTotal);
      else setTotal(normalized.reduce((s, it) => s + Number(it.amount || 0), 0));
    } catch (err) {
      console.error("Monthly fetch failed:", err);
      setError(err.message || "Failed to fetch monthly report");
      setReportAgg(null);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategory = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    setReportAgg(null);
    setItems([]);
    setTotal(0);

    try {
      const res = await fetch(`${API_URL}/reports/category?category=${encodeURIComponent(category)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

      const rawList = Array.isArray(data) ? data : data.expenses ?? [];
      const normalized = rawList.map(normalizeExpense);
      setItems(normalized);

      const sum = normalized.reduce((s, it) => s + Number(it.amount || 0), 0);
      setTotal(sum);
    } catch (err) {
      console.error("Category fetch failed:", err);
      setError(err.message || "Failed to fetch category report");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchDateRange = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    setReportAgg(null);
    setItems([]);
    setTotal(0);

    try {
      if (!start || !end) throw new Error("Please provide both From and To dates.");

      const res = await fetch(
        `${API_URL}/expenses?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&sort=${encodeURIComponent(sort)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

      let rawList = [];
      if (Array.isArray(data)) rawList = data;
      else if (Array.isArray(data.expenses)) rawList = data.expenses;
      else rawList = data.expenses ?? [];

      const normalized = rawList.map(normalizeExpense);
      setItems(normalized);

      const sum = normalized.reduce((s, it) => s + Number(it.amount || 0), 0);
      setTotal(sum);
    } catch (err) {
      console.error("Date-range fetch failed:", err);
      setError(err.message || "Failed to fetch date-range report");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && mode === "monthly") fetchMonthly();
  }, [token]);

  const onSubmit = (e) => {
    e?.preventDefault();
    if (mode === "monthly") fetchMonthly();
    else if (mode === "category") fetchCategory();
    else fetchDateRange();
  };

  const noItemsMessage = () => {
    if (mode === "monthly") return `No expenses found for ${month}/${year}`;
    if (mode === "category") return `No expenses found for category "${category}"`;
    return `No expenses found for ${start} → ${end}`;
  };

  const SummaryRow = () => {
    const totalDisplay = `¥${Number(total || 0)}`;
    if (mode === "monthly") {
      return (
        <div className="mt-2 mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-gray-700">
            <strong>Month:</strong> {month} &nbsp; <strong>Year:</strong> {year}
          </div>
          <div className="text-lg">
            <strong>Total:</strong> <span className="font-bold text-blue-600">{totalDisplay}</span>
          </div>
        </div>
      );
    } else if (mode === "category") {
      return (
        <div className="mt-2 mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-gray-700">
            <strong>Category:</strong> {category}
          </div>
          <div className="text-lg">
            <strong>Total:</strong> <span className="font-bold text-blue-600">{totalDisplay}</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="mt-2 mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-gray-700">
            <strong>From:</strong> {start} &nbsp; <strong>To:</strong> {end} &nbsp; <strong>Sort by:</strong>{" "}
            {sort === "desc" ? "Newest" : "Oldest"}
          </div>
          <div className="text-lg">
            <strong>Total:</strong> <span className="font-bold text-blue-600">{totalDisplay}</span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">Reports</h2>

        <div className="flex gap-2 mb-4 justify-center">
          <button
            onClick={() => setMode("monthly")}
            className={`px-3 py-1 rounded ${mode === "monthly" ? "bg-[#B87333] text-white" : "border"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setMode("category")}
            className={`px-3 py-1 rounded ${mode === "category" ? "bg-[#B87333] text-white" : "border"}`}
          >
            Category
          </button>
          <button
            onClick={() => setMode("daterange")}
            className={`px-3 py-1 rounded ${mode === "daterange" ? "bg-[#B87333] text-white" : "border"}`}
          >
            Date Range
          </button>
        </div>

        <form onSubmit={onSubmit} className="mb-4">
          {mode === "monthly" && (
            <div className="flex gap-3 items-center justify-center">
              <label className="text-sm">
                Month:
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="ml-2 p-1 border rounded w-20"
                />
              </label>
              <label className="text-sm">
                Year:
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="ml-2 p-1 border rounded w-28"
                />
              </label>
              <button className="ml-3 bg-[#6F4E37] text-white px-3 py-1 rounded">Get</button>
            </div>
          )}

          {mode === "category" && (
            <div className="flex gap-2 items-center justify-center">
              <label className="text-sm">
                Category:
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="ml-2 p-1 border rounded"
                />
              </label>
              <button className="ml-3 bg-[#6F4E37] text-white px-3 py-1 rounded">Get</button>
            </div>
          )}

          {mode === "daterange" && (
            <div className="flex flex-wrap gap-3 items-center justify-center">
              <label className="text-sm">
                From:
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="ml-2 p-1 border rounded"
                />
              </label>

              <label className="text-sm">
                To:
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="ml-2 p-1 border rounded"
                />
              </label>

              <label className="text-sm flex items-center gap-2">
                Sort by:
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="ml-2 p-1 border rounded">
                  <option value="desc">Newest</option>
                  <option value="asc">Oldest</option>
                </select>
              </label>

              <button className="ml-3 bg-[#6F4E37] text-white px-3 py-1 rounded">Get</button>
            </div>
          )}
        </form>

        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <SummaryRow />

        {mode === "monthly" && reportAgg && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2 text-gray-800">By category</h3>
            <ul className="divide-y">
              {Object.entries(reportAgg.categories || {}).map(([cat, amt]) => (
                <li key={cat} className="flex justify-between py-2 text-gray-600">
                  <span>{cat}</span>
                  <span className="font-semibold text-gray-600">¥{amt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4">
          <h3 className="font-semibold mb-2 text-gray-800">
            {mode === "monthly"
              ? `Expenses for ${month}/${year}`
              : mode === "category"
              ? `Expenses in "${category}"`
              : `Expenses (${start} to ${end})`}
          </h3>

          {items.length === 0 ? (
            <p className="text-gray-500">{noItemsMessage()}</p>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => (
                <li key={it.id ?? JSON.stringify(it.raw).slice(0, 10)} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                  <div>
                    <p className="font-medium text-gray-800">{it.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(it.date)} • <span className="italic">{it.category}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">¥{it.amount}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
