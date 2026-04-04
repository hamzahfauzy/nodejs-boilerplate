import path from 'path'

export function getView(dir, filename) {
    const rootDir = process.cwd()
    return path.join(rootDir, dir, filename)
}

function parseDate(dateString) {
    if (!dateString) return null;

    // ISO (paling aman)
    if (/^\d{4}-\d{2}-\d{2}T/.test(dateString)) {
        return new Date(dateString);
    }

    // Normalisasi separator
    const normalized = dateString.replace(/\//g, "-");
    const parts = normalized.split("-");

    if (parts.length !== 3) return null;

    let year, month, day;

    // YYYY-MM-DD
    if (parts[0].length === 4) {
        year  = parts[0];
        month = parts[1];
        day   = parts[2];
    } 
    // DD-MM-YYYY
    else if (parts[2].length === 4) {
        day   = parts[0];
        month = parts[1];
        year  = parts[2];
    } 
    else {
        return null; // format aneh
    }

    return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );
};

export function formatDate(date, format = 'Y-m-d H:i:s') {
    if(!date) return date
    date = parseDate(date);

    const pad = (n) => String(n).padStart(2, "0");

    const map = {
        d: pad(date.getDate()),       // 2-digit tanggal
        j: date.getDate(),            // tanggal tanpa leading zero
        m: pad(date.getMonth() + 1),  // 2-digit bulan
        n: date.getMonth() + 1,       // bulan tanpa leading zero
        Y: date.getFullYear(),        // tahun 4 digit
        y: String(date.getFullYear()).slice(-2), // tahun 2 digit
        H: pad(date.getHours()),      // jam 24h
        i: pad(date.getMinutes()),    // menit
        s: pad(date.getSeconds()),    // detik
    };

    return format.replace(/d|j|m|n|Y|y|H|i|s/g, (token) => map[token]);
};

export function formatRupiah(number){
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
}