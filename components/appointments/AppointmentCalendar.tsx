'use client';

import { useState } from 'react';
import { Appointment } from '@/types/appointments';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';

interface AppointmentCalendarProps {
  appointments: any[];
  onSelectAppointment: (appointment: any) => void;
}

export function AppointmentCalendar({ appointments, onSelectAppointment }: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');

  const next = () => {
    if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
    if (viewMode === 'week') setCurrentDate(addDays(currentDate, 7));
    if (viewMode === 'month') setCurrentDate(addDays(currentDate, 30)); // Rough month nav
  };

  const prev = () => {
    if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1));
    if (viewMode === 'week') setCurrentDate(subDays(currentDate, 7));
    if (viewMode === 'month') setCurrentDate(subDays(currentDate, 30));
  };

  const today = () => setCurrentDate(new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  });

  return (
    <div className="bg-card text-card-foreground rounded-xl border shadow-sm flex flex-col h-[700px]">
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={today}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={next}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold ml-4">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        
        <div className="flex bg-muted rounded-md p-1">
          {(['day', 'week', 'month'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-sm transition-colors",
                viewMode === mode 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'month' && (
          <div className="grid grid-cols-7 gap-1 h-full">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-medium text-xs text-muted-foreground py-2">
                {day}
              </div>
            ))}
            {daysInMonth.map((day, i) => {
              const dayAppointments = appointments.filter(apt => isSameDay(new Date(apt.start_time), day));
              return (
                <div 
                  key={i} 
                  className={cn(
                    "min-h-[100px] p-1 border rounded-md transition-colors",
                    isSameMonth(day, currentDate) ? "bg-background" : "bg-muted/30 text-muted-foreground",
                    isSameDay(day, new Date()) && "border-primary/50 bg-primary/5"
                  )}
                >
                  <div className="text-xs font-medium p-1">{format(day, 'd')}</div>
                  <div className="flex flex-col gap-1 mt-1">
                    {dayAppointments.slice(0, 3).map(apt => (
                      <div 
                        key={apt.id} 
                        onClick={() => onSelectAppointment(apt)}
                        className="text-[10px] truncate bg-primary/10 text-primary rounded px-1.5 py-0.5 cursor-pointer hover:bg-primary/20 transition-colors"
                      >
                        {format(new Date(apt.start_time), 'HH:mm')} - {apt.client?.full_name || 'Client'}
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-[10px] text-muted-foreground px-1">
                        +{dayAppointments.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {viewMode !== 'month' && (
          <div className="flex items-center justify-center h-full text-muted-foreground flex-col gap-3">
            <CalendarIcon className="w-12 h-12 opacity-20" />
            <p>Day and Week views are under construction.</p>
            <Button variant="outline" onClick={() => setViewMode('month')}>Switch to Month View</Button>
          </div>
        )}
      </div>
    </div>
  );
}
