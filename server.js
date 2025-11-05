// Простой сервер на Express для хранения оценок в файле data.json
// Подходит для деплоя на Render.com

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const TEACHER_PASSWORD = '1324576800'; // пароль учителя

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // статические файлы из public/

// Убедимся, что data.json существует
async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch (err) {
    const initial = {
      subjects: {
        bilelit: [],
        belyaz: [],
        russlit: [],
        russya: [],
        matem: [],
        fizika: [],
        biologiya: [],
        belist: [],
        vsemist: [],
        franc: [],
        inform: [],
        trud: []
      }
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
  }
}

// GET - вернуть все оценки
app.get('/api/grades', async (req, res) => {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Не удалось прочитать файл с оценками' });
  }
});

// POST - обновить оценки (требуется пароль учителя)
app.post('/api/grades', async (req, res) => {
  try {
    const { password, record } = req.body;
    if (password !== TEACHER_PASSWORD) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }
    if (!record) {
      return res.status(400).json({ error: 'Пустые данные' });
    }
    // Запишем объект record в data.json
    await fs.writeFile(DATA_FILE, JSON.stringify(record, null, 2), 'utf8');
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка записи' });
  }
});

// При любом другом GET отдадим index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

(async () => {
  await ensureDataFile();
  app.listen(3000, () => {
    console.log(`Server listening on port ${PORT}`);
  });
})();
