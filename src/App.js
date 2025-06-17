import React, { useEffect, useState } from "react";

function App() {
  const [userId, setUserId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(false);

  // Укажи свой API-адрес для деплоя, иначе оставить /api/
  const API_URL = process.env.REACT_APP_API_URL || "https://YOUR_API_DOMAIN/api";

  useEffect(() => {
    // Получаем user_id через Telegram WebApp API
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.expand();
      const uid = window.Telegram.WebApp.initDataUnsafe?.user?.id || null;
      setUserId(uid);
      if (uid) fetchTasks(uid);
    }
  }, []);

  const fetchTasks = (uid) => {
    setLoading(true);
    fetch(`${API_URL}/tasks?user_id=${uid}`)
      .then(res => res.json())
      .then(data => setTasks(data.tasks || []))
      .finally(() => setLoading(false));
  };

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    setLoading(true);
    fetch(`${API_URL}/add_task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        text: newTask.trim()
      })
    })
      .then(() => {
        setNewTask("");
        fetchTasks(userId);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "0 auto" }}>
      <h2>Telegram WebApp интерфейс</h2>
      <div style={{ marginBottom: 16 }}>
        Ваш Telegram user_id: <b>{userId || "не определён"}</b>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="Новая задача"
          style={{ flex: 1 }}
        />
        <button onClick={handleAddTask} disabled={!newTask.trim() || !userId || loading}>
          {loading ? "..." : "Добавить"}
        </button>
      </div>
      <hr />
      <div>
        <h3>Ваши задачи:</h3>
        {loading && <div>Загрузка...</div>}
        {(!tasks || tasks.length === 0) && !loading && <div>Нет задач</div>}
        <ul>
          {tasks.map((t, idx) => (
            <li key={idx}>
              <b>{t.task || t.text}</b>
              {t.client ? <> для <i>{t.client}</i></> : null}
              {t.week ? <> — неделя {t.week}</> : null}
              {t.type ? <> — <span style={{color: t.type === "done" ? "green" : "blue"}}>{t.type}</span></> : null}
              {t.hours ? <> — {t.hours} ч.</> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;