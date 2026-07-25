// Server-local calendar day as YYYY-MM-DD. Using toISOString() here would
// bucket by UTC instead, which silently shifts the "day" boundary to
// mid-afternoon/evening local time for anyone west of UTC.
function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayKey() {
  return localDateKey(new Date());
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDateKey(d);
}

module.exports = { localDateKey, todayKey, yesterdayKey };
