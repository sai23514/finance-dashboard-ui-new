import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [transactions, setTransactions] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [editId, setEditId] = useState<string | null>(null);

  // Check login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  // ================= AUTH =================

  const register = async () => {
    await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    alert("Registered! Now login.");
    setIsRegister(false);
  };

  const login = async () => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
    } else {
      alert("Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  // ================= TRANSACTIONS =================

  const fetchData = () => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/transactions", {
      headers: {
        Authorization: token || ""
      }
    })
      .then(res => res.json())
      .then(data => setTransactions(data));
  };

  useEffect(() => {
    if (isLoggedIn) fetchData();
  }, [isLoggedIn]);

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    if (!title || !amount) return;

    if (editId) {
      await fetch(`http://localhost:5000/api/transactions/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || ""
        },
        body: JSON.stringify({ title, amount, type })
      });
      setEditId(null);
    } else {
      await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || ""
        },
        body: JSON.stringify({ title, amount, type })
      });
    }

    setTitle("");
    setAmount("");
    fetchData();
  };

  const deleteTransaction = async (id: string) => {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:5000/api/transactions/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token || ""
      }
    });

    fetchData();
  };

  const editTransaction = (t: any) => {
    setTitle(t.title);
    setAmount(t.amount);
    setType(t.type);
    setEditId(t._id);
  };

  // ================= CALCULATIONS =================

  const income = transactions
    .filter(t => t.type === "income")
    .reduce((a, t) => a + Number(t.amount), 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((a, t) => a + Number(t.amount), 0);

  const balance = income - expense;

  // ================= CHART =================

  const chartData = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        data: [income, expense],
        backgroundColor: ["#16a34a", "#dc2626"]
      }
    ]
  };

  // ================= UI =================

  if (!isLoggedIn) {
    return (
      <div style={{ padding: "50px" }}>
        <h1>{isRegister ? "Register" : "Login"}</h1>

        <input
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
        />

        {isRegister ? (
          <>
            <button onClick={register}>Register</button>
            <p onClick={() => setIsRegister(false)}>Go to Login</p>
          </>
        ) : (
          <>
            <button onClick={login}>Login</button>
            <p onClick={() => setIsRegister(true)}>Create Account</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>💰 Finance Dashboard</h1>

      <button onClick={logout}>Logout</button>

      <h2>Balance: ₹{balance}</h2>
      <p style={{ color: "green" }}>Income: ₹{income}</p>
      <p style={{ color: "red" }}>Expense: ₹{expense}</p>

      <div style={{ width: "300px" }}>
        <Pie data={chartData} />
      </div>

      <hr />

      <h3>{editId ? "Edit" : "Add"} Transaction</h3>

      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />

      <select value={type} onChange={e => setType(e.target.value)}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <button onClick={handleSubmit}>
        {editId ? "Update" : "Add"}
      </button>

      <hr />

      {transactions.map(t => (
        <div key={t._id}>
          {t.title} - ₹{t.amount} ({t.type})

          <button onClick={() => editTransaction(t)}>Edit</button>
          <button onClick={() => deleteTransaction(t._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default App;