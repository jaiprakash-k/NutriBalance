// NutriBalance: Single-file React Nutrition App with USDA API
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_KEY = "GhBdgIlexAjUxfGVTMcDpXhTt8EtMXDW2p3X5yVr";

// --- API Fetch ---
async function fetchFood(query) {
  const res = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
      query
    )}&api_key=${API_KEY}`
  );
  const data = await res.json();

  if (!data.foods) return [];

  // Map USDA nutrients to app structure
  return data.foods.map((food) => {
    const nutrients = {};
    food.foodNutrients.forEach((n) => {
      switch (n.nutrientName.toLowerCase()) {
        case "energy":
          nutrients.calories = n.value;
          break;
        case "protein":
          nutrients.protein = n.value;
          break;
        case "total lipid (fat)":
          nutrients.fat = n.value;
          break;
        case "carbohydrate, by difference":
          nutrients.carbs = n.value;
          break;
        case "fiber, total dietary":
          nutrients.fiber = n.value;
          break;
        case "vitamin c, total ascorbic acid":
          nutrients.vitaminC = n.value;
          break;
        default:
          break;
      }
    });
    return {
      name: food.description,
      calories: nutrients.calories || 0,
      protein: nutrients.protein || 0,
      fat: nutrients.fat || 0,
      carbs: nutrients.carbs || 0,
      fiber: nutrients.fiber || 0,
      vitaminC: nutrients.vitaminC || 0,
    };
  });
}

// Default foodDB (fallback)
const defaultFoodDB = [
  { name: "Apple", calories: 52, protein: 0.3, fat: 0.2, carbs: 14, fiber: 2.4, vitaminC: 4.6 },
  { name: "Chicken Breast", calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0, vitaminC: 0 },
  { name: "Broccoli", calories: 55, protein: 3.7, fat: 0.6, carbs: 11, fiber: 3.8, vitaminC: 89.2 },
  { name: "Rice", calories: 130, protein: 2.7, fat: 0.3, carbs: 28, fiber: 0.4, vitaminC: 0 },
  { name: "Egg", calories: 68, protein: 6.3, fat: 4.8, carbs: 0.6, fiber: 0, vitaminC: 0 },
];

const defaultRecommendations = {
  protein: { adult: 50, child: 30 },
  fat: { adult: 70, child: 50 },
  carbs: { adult: 260, child: 130 },
  fiber: { adult: 30, child: 20 },
  vitaminC: { adult: 90, child: 50 },
};

function getAgeGroup(age) {
  return age < 18 ? "child" : "adult";
}

function calculateNutrients(meals, foodDB) {
  const totals = { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, vitaminC: 0 };
  meals.forEach(({ food, portion }) => {
    const item = foodDB.find((f) => f.name === food);
    if (item) {
      Object.keys(totals).forEach((nutrient) => {
        totals[nutrient] += (item[nutrient] || 0) * portion;
      });
    }
  });
  return totals;
}

function exportCSV(data, filename) {
  const keys = Object.keys(data[0] || {});
  const csv = [keys.join(","), ...data.map((row) => keys.map((k) => row[k]).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Accessible Input
function AccessibleInput({ label, ...props }) {
  return (
    <div className="mb-2">
      <label className="block text-sm font-medium mb-1" htmlFor={props.id}>
        {label}
      </label>
      <input className="w-full p-2 border rounded" {...props} />
    </div>
  );
}

// Main App
export default function NutriBalance() {
  const [page, setPage] = useState("home");
  const [meals, setMeals] = useState([]);
  const [form, setForm] = useState({ age: "", weight: "", height: "", activity: "sedentary" });
  const [foodDB, setFoodDB] = useState(() => {
    const db = localStorage.getItem("nutri_foodDB");
    return db ? JSON.parse(db) : defaultFoodDB;
  });
  const [recommendations, setRecommendations] = useState(() => {
    const rec = localStorage.getItem("nutri_recommendations");
    return rec ? JSON.parse(rec) : defaultRecommendations;
  });
  const [nutrients, setNutrients] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [admin, setAdmin] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [userSubmissions, setUserSubmissions] = useState(() => {
    const subs = localStorage.getItem("nutri_submissions");
    return subs ? JSON.parse(subs) : [];
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Persist data
  useEffect(() => {
    localStorage.setItem("nutri_foodDB", JSON.stringify(foodDB));
  }, [foodDB]);
  useEffect(() => {
    localStorage.setItem("nutri_recommendations", JSON.stringify(recommendations));
  }, [recommendations]);
  useEffect(() => {
    localStorage.setItem("nutri_submissions", JSON.stringify(userSubmissions));
  }, [userSubmissions]);

  // Handle form submit
  function handleAnalyze(e) {
    e.preventDefault();
    if (!form.age || !form.weight || !form.height || meals.length === 0) return;
    const nutrients = calculateNutrients(meals, foodDB);
    setNutrients(nutrients);
    setUserSubmissions([
      ...userSubmissions,
      { ...form, meals, nutrients, date: new Date().toISOString() },
    ]);
    setPage("analysis");
    const group = getAgeGroup(Number(form.age));
    const rec = Object.fromEntries(
      Object.entries(recommendations).map(([k, v]) => [k, v[group]])
    );
    const sug = [];
    Object.keys(rec).forEach((nutrient) => {
      if (nutrients[nutrient] < rec[nutrient]) {
        sug.push(
          `Increase ${nutrient} intake (recommended: ${rec[nutrient]}, current: ${nutrients[
            nutrient
          ].toFixed(1)})`
        );
      } else if (nutrients[nutrient] > rec[nutrient] * 1.2) {
        sug.push(
          `Reduce ${nutrient} intake (recommended: ${rec[nutrient]}, current: ${nutrients[
            nutrient
          ].toFixed(1)})`
        );
      }
    });
    setSuggestions(sug);
  }

  // Admin login
  function handleAdminLogin(e) {
    e.preventDefault();
    if (adminPw === "nutriadmin") setAdmin(true);
    else alert("Incorrect password");
  }

  // Search API
  async function handleSearch() {
    if (!search) return;
    setLoading(true);
    const results = await fetchFood(search);
    if (results.length > 0) {
      setFoodDB(results);
    } else {
      alert("No results found.");
    }
    setLoading(false);
  }

  // Accessible button
  function AccessibleButton({ children, ...props }) {
    return (
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        {...props}
      >
        {children}
      </button>
    );
  }

  // Home
  if (page === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-2 text-green-800">NutriBalance</h1>
        <p className="mb-6 text-lg max-w-xl text-center">
          NutriBalance helps you analyze your daily nutrition, visualize your intake, and get
          personalized diet suggestions. Admins can manage the food database and recommendations. All
          data is stored locally for privacy.
        </p>
        <AccessibleButton onClick={() => setPage("userform")}>
          Start Nutrition Analysis
        </AccessibleButton>
        <AccessibleButton className="mt-2" onClick={() => setPage("admin")}>
          Admin Panel
        </AccessibleButton>
      </div>
    );
  }

  // User Form
  if (page === "userform") {
    return (
      <div className="max-w-xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Enter Your Dietary Habits</h2>
        <form onSubmit={handleAnalyze} aria-label="Nutrition Form">
          <AccessibleInput
            label="Age"
            id="age"
            type="number"
            min="1"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            required
          />
          <AccessibleInput
            label="Weight (kg)"
            id="weight"
            type="number"
            min="1"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
            required
          />
          <AccessibleInput
            label="Height (cm)"
            id="height"
            type="number"
            min="1"
            value={form.height}
            onChange={(e) => setForm({ ...form, height: e.target.value })}
            required
          />

          {/* Search foods */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Search Foods</label>
            <div className="flex gap-2">
              <input
                className="p-2 border rounded flex-1"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g., Apple, Rice"
              />
              <button
                type="button"
                className="bg-blue-500 text-white px-3 py-2 rounded"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? "Loading..." : "Search"}
              </button>
            </div>
          </div>

          {/* Meals */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Meals</label>
            {meals.map((meal, i) => (
              <div key={i} className="flex gap-2 mb-1">
                <select
                  className="p-2 border rounded"
                  value={meal.food}
                  onChange={(e) => {
                    const newMeals = [...meals];
                    newMeals[i].food = e.target.value;
                    setMeals(newMeals);
                  }}
                >
                  {foodDB.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <input
                  className="p-2 border rounded w-20"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={meal.portion}
                  onChange={(e) => {
                    const newMeals = [...meals];
                    newMeals[i].portion = Number(e.target.value);
                    setMeals(newMeals);
                  }}
                  aria-label="Portion"
                />
                <button
                  type="button"
                  className="text-red-500"
                  aria-label="Remove meal"
                  onClick={() => setMeals(meals.filter((_, idx) => idx !== i))}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="bg-green-500 text-white px-2 py-1 rounded mt-2"
              onClick={() => setMeals([...meals, { food: foodDB[0].name, portion: 1 }])}
            >
              Add Meal
            </button>
          </div>

          <AccessibleButton type="submit">Analyze Nutrition</AccessibleButton>
          <AccessibleButton className="ml-2" type="button" onClick={() => setPage("home")}>
            Back
          </AccessibleButton>
        </form>
      </div>
    );
  }

  // Nutrient Analysis
  if (page === "analysis" && nutrients) {
    const group = getAgeGroup(Number(form.age));
    const rec = Object.fromEntries(
      Object.entries(recommendations).map(([k, v]) => [k, v[group]])
    );
    const chartData = Object.keys(rec).map((nutrient) => ({
      name: nutrient,
      Intake: Number(nutrients[nutrient].toFixed(1)),
      Recommended: rec[nutrient],
    }));
    return (
      <div className="max-w-xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Nutrient Analysis</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} aria-label="Nutrient Chart">
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Intake" fill="#34d399" />
            <Bar dataKey="Recommended" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
        <ul className="mt-4 mb-4 list-disc pl-6">
          {suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
        <AccessibleButton onClick={() => setPage("userform")}>Back to Form</AccessibleButton>
        <AccessibleButton className="ml-2" onClick={() => setPage("home")}>
          Home
        </AccessibleButton>
      </div>
    );
  }

  // Admin Panel (login)
  if (page === "admin" && !admin) {
    return (
      <div className="max-w-sm mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <form onSubmit={handleAdminLogin}>
          <AccessibleInput
            label="Password"
            id="adminpw"
            type="password"
            value={adminPw}
            onChange={(e) => setAdminPw(e.target.value)}
            required
          />
          <AccessibleButton type="submit">Login</AccessibleButton>
          <AccessibleButton className="ml-2" type="button" onClick={() => setPage("home")}>
            Back
          </AccessibleButton>
        </form>
        <div className="mt-4 text-xs text-gray-500">
          Default password: <span className="font-mono">nutriadmin</span>
        </div>
      </div>
    );
  }

  // Admin Panel (after login)
  if (page === "admin" && admin) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Food Database</h3>
          <table className="w-full border mb-2 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th>Name</th>
                <th>Calories</th>
                <th>Protein</th>
                <th>Fat</th>
                <th>Carbs</th>
                <th>Fiber</th>
                <th>Vitamin C</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {foodDB.map((f, i) => (
                <tr key={i}>
                  <td>
                    <input
                      className="w-full"
                      value={f.name}
                      onChange={(e) => {
                        const db = [...foodDB];
                        db[i].name = e.target.value;
                        setFoodDB(db);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full"
                      type="number"
                      value={f.calories}
                      onChange={(e) => {
                        const db = [...foodDB];
                        db[i].calories = Number(e.target.value);
                        setFoodDB(db);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full"
                      type="number"
                      value={f.protein}
                      onChange={(e) => {
                        const db = [...foodDB];
                        db[i].protein = Number(e.target.value);
                        setFoodDB(db);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full"
                      type="number"
                      value={f.fat}
                      onChange={(e) => {
                        const db = [...foodDB];
                        db[i].fat = Number(e.target.value);
                        setFoodDB(db);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full"
                      type="number"
                      value={f.carbs}
                      onChange={(e) => {
                        const db = [...foodDB];
                        db[i].carbs = Number(e.target.value);
                        setFoodDB(db);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full"
                      type="number"
                      value={f.fiber}
                      onChange={(e) => {
                        const db = [...foodDB];
                        db[i].fiber = Number(e.target.value);
                        setFoodDB(db);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full"
                      type="number"
                      value={f.vitaminC}
                      onChange={(e) => {
                        const db = [...foodDB];
                        db[i].vitaminC = Number(e.target.value);
                        setFoodDB(db);
                      }}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="text-red-500"
                      aria-label="Remove food"
                      onClick={() => setFoodDB(foodDB.filter((_, idx) => idx !== i))}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="bg-green-500 text-white px-2 py-1 rounded"
            onClick={() =>
              setFoodDB([
                ...foodDB,
                { name: "", calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, vitaminC: 0 },
              ])
            }
          >
            Add Food
          </button>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Recommendations (per day)</h3>
          <table className="w-full border mb-2 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th>Nutrient</th>
                <th>Adult</th>
                <th>Child</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(recommendations).map((nutrient, i) => (
                <tr key={i}>
                  <td>{nutrient}</td>
                  <td>
                    <input
                      className="w-full"
                      type="number"
                      value={recommendations[nutrient].adult}
                      onChange={(e) => {
                        const rec = { ...recommendations };
                        rec[nutrient].adult = Number(e.target.value);
                        setRecommendations(rec);
                      }}
                      aria-label="Adult Recommendation"
                    />
                  </td>
                  <td>
                    <input
                      className="w-full"
                      type="number"
                      value={recommendations[nutrient].child}
                      onChange={(e) => {
                        const rec = { ...recommendations };
                        rec[nutrient].child = Number(e.target.value);
                        setRecommendations(rec);
                      }}
                      aria-label="Child Recommendation"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">User Submissions</h3>
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded mb-2"
            onClick={() => exportCSV(userSubmissions, "nutri_submissions.csv")}
          >
            Export CSV
          </button>
          <table className="w-full border text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th>Date</th>
                <th>Age</th>
                <th>Weight</th>
                <th>Height</th>
                <th>Activity</th>
                <th>Meals</th>
                <th>Nutrients</th>
              </tr>
            </thead>
            <tbody>
              {userSubmissions.map((sub, i) => (
                <tr key={i}>
                  <td>{new Date(sub.date).toLocaleString()}</td>
                  <td>{sub.age}</td>
                  <td>{sub.weight}</td>
                  <td>{sub.height}</td>
                  <td>{sub.activity}</td>
                  <td>{sub.meals.map((m) => `${m.food} (${m.portion})`).join(", ")}</td>
                  <td>
                    {Object.entries(sub.nutrients)
                      .map(([k, v]) => `${k}: ${v.toFixed(1)}`)
                      .join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AccessibleButton
          onClick={() => {
            setAdmin(false);
            setPage("home");
          }}
        >
          Logout
        </AccessibleButton>
      </div>
    );
  }

  // Fallback
  return <div className="p-4">Invalid page</div>;
}