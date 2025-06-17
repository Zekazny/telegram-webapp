import React, { useEffect, useState } from "react";

function App() {
  const [userId, setUserId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    // Получить user_id через Telegram WebApp API
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.expand();
      const uid = window.Telegram.WebApp.initDataUnsafe?.user?.id || null;
      setUserId(uid);
      if (uid) fetchTasks(uid);
    }
  }, []);

  const fetchTasks = (uid) => {
    fetch(`http://localhost:8000/api/tasks?user_id=${uid}`)
      .then(res => res.json())
      .then(data => setTasks(data.tasks));
  };

  const handleAddTask = () => {
    fetch(`http://localhost:8000/api/add_task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        text: newTask
      })
    }).then(() => {
      setNewTask("");
      fetchTasks(userId);
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Telegram WebApp интерфейс</h2>
      <div>Ваш Telegram user_id: <b>{userId}</b></div>
      <div>
        <input
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="Новая задача"
        />
        <button onClick={handleAddTask}>Добавить</button>
      </div>
      <hr />
      <div>
        <h3>Ваши задачи:</h3>
        <ul>
          {tasks.map((t, idx) => (
            <li key={idx}>{t.text} ({t.week}) — {t.client}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;