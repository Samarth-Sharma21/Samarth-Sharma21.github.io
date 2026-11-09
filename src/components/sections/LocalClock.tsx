import { useEffect, useState } from 'react';

const format = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true });
const current = () => format.format(new Date()).toUpperCase();

export default function LocalClock() {
  const [time, setTime] = useState(current);
  useEffect(() => {
    const timer = window.setInterval(() => setTime(current()), 15000);
    return () => window.clearInterval(timer);
  }, []);
  return <span className="local-clock">{time}</span>;
}
