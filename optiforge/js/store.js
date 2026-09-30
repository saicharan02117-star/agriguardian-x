const KEY='agx.inspections.v1';
export function readRecords(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
export function saveRecord(record){const rows=readRecords();rows.unshift(record);localStorage.setItem(KEY,JSON.stringify(rows.slice(0,100)));return rows}
export function clearRecords(){localStorage.removeItem(KEY)}
export function plantKey(r){return`${r.field}|${r.row}|${r.plant}`.toLowerCase()}
