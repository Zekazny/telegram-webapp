import React, { useEffect, useState } from "react";

function App() {
  const [userId, setUserId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [client, setClient] = useState("");
  const [task, setTask] = useState("");
  const [hours, setHours] = useState("");
  const [type, setType] = useState("plan");
  const [loading, setLoading] = useState(false);

  // Укажи свой реальный API_URL
  const API_URL = "https://telegram-webapp-neon.vercel.app";

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.expand();
      let data = window.Telegram.WebApp.initDataUnsafe;
      // Обработка случая, когда initDataUnsafe — строка
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (e) {
          data = {};
        }
      }
      console.log("initDataUnsafe:", data);
      const uid = data?.user?.id || null;
      setUserId(uid);
      if (uid) fetchTasks(uid);
    } else {
      console.log("Не в Telegram WebApp");
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
    if (!task.trim() || !client.trim() || !hours || !userId) return;
    setLoading(true);
    fetch(`${API_URL}/add_task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        client: client.trim(),
        task: task.trim(),
        hours: Number(hours),
        type: type
      })
    }).then(() => {
      setTask("");
      setClient("");
      setHours("");
      setType("plan");
      fetchTasks(userId);
    }).finally(() => setLoading(false));
  };

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2 style={{marginBottom: 12}}>Мои задачи в Telegram WebApp</h2>
      <div style={{marginBottom: 16}}>
        <b>user_id:</b> {userId || <span style={{color:'gray'}}>не определён</span>}
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:8, marginBottom:24}}>
        <input
          placeholder="Клиент"
          value={client}
          onChange={e => setClient(e.target.value)}
        />
        <input
          placeholder="Задача"
          value={task}
          onChange={e => setTask(e.target.value)}
        />
        <input
          placeholder="Часы"
          type="number"
          min="0"
          value={hours}
          onChange={e => setHours(e.target.value)}
        />
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="plan">План</option>
          <option value="done">Выполнено</option>
        </select>
        <button
          onClick={handleAddTask}
          disabled={!task.trim() || !client.trim() || !hours || !userId || loading}
        >
          {loading ? "Сохраняю..." : "Добавить задачу"}
        </button>
      </div>
      <hr />
      <div>
        <h3>Список задач:</h3>
        {loading && <div>Загрузка...</div>}
        {!loading && tasks.length === 0 && <div>Нет задач</div>}
        <ul style={{padding:0, listStyle:"none"}}>
          {tasks.map((t, idx) => (
            <li key={idx} style={{
              background:"#f4f4f4", marginBottom:8, padding:12, borderRadius:8
            }}>
              <div>
                <b>{t.task || t.text}</b> <span style={{color:'#888'}}>{t.client && `для ${t.client}`}</span>
              </div>
              <div style={{fontSize:13}}>
                {t.week && <>Неделя: {t.week} • </>}
                {t.type && <span style={{color: t.type==="done"?"green":"blue"}}>{t.type==="done"?"Выполнено":"План"}</span>} • {t.hours} ч.
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;