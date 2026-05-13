import { useEffect, useRef } from 'react';
import type { Appointment } from '../services/appointmentService';

// Parses "hh:mm a" (e.g. "12:30 PM") into today's Date at that time.
function parseAppointmentTime(dateStr: string, timeStr: string): Date | null {
  try {
    // dateStr from API: "May 11, 2025" — use Date.parse with time appended
    const dt = new Date(`${dateStr} ${timeStr}`);
    return isNaN(dt.getTime()) ? null : dt;
  } catch {
    return null;
  }
}

export function useAppointmentReminders(appointments: Appointment[]) {
  const timerIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Clear any previously scheduled timers
    timerIds.current.forEach(clearTimeout);
    timerIds.current = [];

    const confirmed = appointments.filter(a => a.status === 'CONFIRMED');
    if (confirmed.length === 0) return;

    // Request permission once (no-op if already granted/denied)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const now = Date.now();

    for (const appt of confirmed) {
      const apptTime = parseAppointmentTime(appt.appointmentDate, appt.startTime);
      if (!apptTime) continue;

      const reminderAt = apptTime.getTime() - 30 * 60 * 1000; // 30 min before
      const delay = reminderAt - now;

      if (delay <= 0) continue; // already past reminder time

      const id = setTimeout(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('MediCore – Upcoming Appointment', {
            body: `Your appointment with ${appt.doctorName} starts in 30 minutes${appt.clinicName ? ` at ${appt.clinicName}` : ''}.`,
            icon: '/vite.svg',
            tag: `appt-reminder-${appt.id}`,
          });
        }
      }, delay);

      timerIds.current.push(id);
    }

    return () => {
      timerIds.current.forEach(clearTimeout);
      timerIds.current = [];
    };
  }, [appointments]);
}
