const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let kodeAksesData = []; // Data kode akses dari Excel
let excelDataByMonth = {}; // Data insentif per bulan

const upload = multer({ storage: multer.memoryStorage() });

// Upload file Excel Kode Akses
app.post('/upload-kode-akses', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    kodeAksesData = xlsx.utils.sheet_to_json(sheet);
    res.json({ success: true, count: kodeAksesData.length });
});

// Login dengan kode akses
app.post('/login', (req, res) => {
    const { code } = req.body;
    const found = kodeAksesData.find(row => String(row.kode_akses) === String(code));
    if (found) {
        res.json({ success: true, nama: found.nama });
    } else {
        res.status(401).json({ success: false, message: 'Kode akses salah' });
    }
});

// Upload file Excel Insentif Payroll
app.post('/upload-excel', upload.single('file'), (req, res) => {
    const { month } = req.body;
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    excelDataByMonth[month] = data;
    res.json({ success: true });
});

// Ambil data insentif sesuai bulan
app.get('/incentive', (req, res) => {
    const { month } = req.query;
    const data = excelDataByMonth[month] || [];
    res.json(data);
});

app.listen(3001, () => {
    console.log('Server running on port 3001');
});
