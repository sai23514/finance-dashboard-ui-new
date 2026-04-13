const API_URL = "http://localhost:5000/api";

export const getTransactions = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/transactions`, {
    headers: {
      Authorization: token || ""
    }
  });

  return res.json();
};

export const addTransaction = async (data: any) => {
  const token = localStorage.getItem("token");

  await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token || ""
    },
    body: JSON.stringify(data)
  });
};