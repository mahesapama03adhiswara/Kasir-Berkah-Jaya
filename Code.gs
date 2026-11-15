/**
 * Backend Kasir Toko Berkah Jaya - Google Apps Script
 * Tempel di Extensions > Apps Script pada Google Spreadsheet Anda,
 * ganti TOKEN, lalu Deploy sebagai Web App (Execute as: Me, Access: Anyone).
 */
const TOKEN = 'ganti-dengan-token-rahasia-anda';

const HEAD = {
  Barang: ['ID', 'Nama Barang', 'Jenis Barang', 'Satuan', 'Jumlah Stok Masuk', 'Total Stok',
           'Harga Satuan (Beli)', 'Harga Barang x Stok', 'Margin %', 'Harga Jual', 'Update (ms)', 'Dihapus', 'Update'],
  StokMasuk: ['ID', 'Tanggal', 'ID Barang', 'Nama Barang', 'Jumlah Masuk', 'Harga Beli'],
  Penjualan: ['No Nota', 'Tanggal', 'Total', 'Bayar', 'Kembali', 'Kasir'],
  DetailPenjualan: ['No Nota', 'ID Barang', 'Nama Barang', 'Qty', 'Harga', 'Subtotal', 'Harga Beli']
};

function setup() { Object.keys(HEAD).forEach(sh); }

function sh(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(name);
  if (!s) {
    s = ss.insertSheet(name);
    s.appendRow(HEAD[name]);
    s.setFrozenRows(1);
    s.getRange(1, 1, 1, HEAD[name].length).setFontWeight('bold').setBackground('#d9ead3');
  }
  return s;
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() { return out({ ok: true, msg: 'API Kasir Berkah Jaya aktif' }); }

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.token !== TOKEN) return out({ ok: false, error: 'Token salah' });
    upsertProducts(d.products || []);
    appendStockIn(d.stockIn || []);
    appendSales(d.sales || []);
    return out({ ok: true, products: readProducts() });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function upsertProducts(list) {
  if (!list.length) return;
  const s = sh('Barang');
  const last = s.getLastRow();
  const data = last > 1 ? s.getRange(2, 1, last - 1, 12).getValues() : [];
  const idx = {};
  data.forEach((r, i) => idx[String(r[0])] = i);
  list.forEach(p => {
    const row = [p.id, p.nama, p.jenis, p.satuan, p.stokMasuk, p.stok, p.hargaBeli,
                 p.hargaBeli * p.stok, p.margin, p.hargaJual, p.updatedAt, p.deleted ? true : false];
    if (String(p.id) in idx) {
      const i = idx[String(p.id)];
      if (Number(data[i][10]) > Number(p.updatedAt)) return; // data server lebih baru
      data[i] = row;
    } else {
      idx[String(p.id)] = data.length;
      data.push(row);
    }
  });
  s.getRange(2, 1, data.length, 12).setValues(data);
  const t = s.getRange(2, 13, data.length, 1);
  t.setValues(data.map(r => [new Date(Number(r[10]))]));
  t.setNumberFormat('dd/mm/yyyy hh:mm');
}

function readProducts() {
  const s = sh('Barang');
  const last = s.getLastRow();
  if (last < 2) return [];
  return s.getRange(2, 1, last - 1, 12).getValues().map(r => ({
    id: String(r[0]), nama: String(r[1]), jenis: String(r[2]), satuan: String(r[3]),
    stokMasuk: Number(r[4]), stok: Number(r[5]), hargaBeli: Number(r[6]),
    margin: Number(r[8]), hargaJual: Number(r[9]), updatedAt: Number(r[10]),
    deleted: r[11] === true || r[11] === 'TRUE'
  }));
}

function existingIds(s) {
  const last = s.getLastRow(), o = {};
  if (last > 1) s.getRange(2, 1, last - 1, 1).getValues().forEach(r => o[String(r[0])] = 1);
  return o;
}

function writeRows(s, rows) {
  if (rows.length) s.getRange(s.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function appendStockIn(list) {
  if (!list.length) return;
  const s = sh('StokMasuk'), ex = existingIds(s), rows = [];
  list.forEach(x => { if (!ex[String(x.id)]) rows.push([x.id, new Date(x.tgl), x.pid, x.nama, x.qty, x.hargaBeli]); });
  writeRows(s, rows);
}

function appendSales(list) {
  if (!list.length) return;
  const s = sh('Penjualan'), d = sh('DetailPenjualan'), ex = existingIds(s);
  const rows = [], det = [];
  list.forEach(x => {
    if (ex[String(x.id)]) return;
    rows.push([x.id, new Date(x.tgl), x.total, x.bayar, x.kembali, x.kasir]);
    x.items.forEach(i => det.push([x.id, i.pid, i.nama, i.qty, i.harga, i.qty * i.harga, i.beli]));
  });
  writeRows(s, rows);
  writeRows(d, det);
}
