'use client';

import { useState, useEffect } from 'react';
import { getAvailableSlotsAction, bookAppointmentAction, getOrCreateTestClientAction } from '@/lib/actions/scheduling';
import { SchedulingCalendar } from '@/components/scheduling/scheduling-calendar';
import { DurationSelector } from '@/components/scheduling/duration-selector';
import { AvailableSlotsList } from '@/components/scheduling/available-slots-list';
import { AppointmentPreview } from '@/components/scheduling/appointment-preview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function SchedulingTestPage() {
  // Test data state
  const [agencyId, setAgencyId] = useState('00000000-0000-0000-0000-000000000000');
  const [clientId, setClientId] = useState('00000000-0000-0000-0000-000000000000');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  
  // Form state
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [duration, setDuration] = useState(60);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  
  // Data state
  const [slots, setSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isClientLoading, setIsClientLoading] = useState(false);

  // Fetch availability when date, duration, or test params change
  useEffect(() => {
    async function fetchSlots() {
      if (!agencyId || !date) return;
      
      setIsLoading(true);
      setSelectedSlot(null); // Reset selection
      
      const response = await getAvailableSlotsAction({
        agency_id: agencyId,
        date,
        duration_minutes: duration,
        timezone
      });

      if (response.success && response.data) {
        setSlots(response.data.slots);
      } else {
        toast.error(response.error || 'Failed to fetch slots');
        setSlots([]);
      }
      setIsLoading(false);
    }

    fetchSlots();
  }, [agencyId, date, duration, timezone]);

  const handleGenerateClient = async () => {
    if (!agencyId || agencyId === '00000000-0000-0000-0000-000000000000') {
      toast.error('Please enter a valid Agency ID first.');
      return;
    }
    setIsClientLoading(true);
    const response = await getOrCreateTestClientAction(agencyId);
    setIsClientLoading(false);
    
    if (response.success && response.clientId) {
      setClientId(response.clientId);
      toast.success('Test Client auto-filled!');
    } else {
      toast.error(response.error || 'Failed to generate test client.');
    }
  };

  const handleBookSlot = async () => {
    if (!selectedSlot || !agencyId || !clientId) return;

    setIsBooking(true);
    
    const response = await bookAppointmentAction({
      agency_id: agencyId,
      client_id: clientId,
      start_time: selectedSlot.start,
      end_time: selectedSlot.end,
      duration_minutes: duration,
      timezone,
      appointment_source: 'dashboard',
      appointment_type: 'consultation'
    });

    setIsBooking(false);

    if (response.success) {
      toast.success('Appointment booked successfully!');
      setSelectedSlot(null);
      // Refresh slots
      const refreshResponse = await getAvailableSlotsAction({
        agency_id: agencyId,
        date,
        duration_minutes: duration,
        timezone
      });
      if (refreshResponse.success && refreshResponse.data) {
        setSlots(refreshResponse.data.slots);
      }
    } else {
      toast.error(response.error || 'Failed to book appointment');
    }
  };

  return (
    <div className="container max-w-4xl py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scheduling Engine QA</h1>
        <p className="text-muted-foreground">Internal testing page for slot generation and concurrency prevention.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-4 p-4 border rounded-lg bg-card">
            <h3 className="font-semibold text-lg">Test Parameters</h3>
            
            <div className="space-y-2">
              <Label htmlFor="agencyId">Agency ID</Label>
              <Input 
                id="agencyId" 
                value={agencyId} 
                onChange={e => setAgencyId(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="clientId">Client ID</Label>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="h-auto p-0" 
                  onClick={handleGenerateClient}
                  disabled={isClientLoading}
                >
                  {isClientLoading ? 'Generating...' : 'Auto-fill Test Client'}
                </Button>
              </div>
              <Input 
                id="clientId" 
                value={clientId} 
                onChange={e => setClientId(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input 
                id="timezone" 
                value={timezone} 
                onChange={e => setTimezone(e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-lg bg-card">
            <h3 className="font-semibold text-lg">Scheduling Options</h3>
            <SchedulingCalendar date={date} onChange={setDate} />
            <DurationSelector value={duration} onChange={setDuration} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Available Slots</h3>
            <AvailableSlotsList 
              slots={slots} 
              isLoading={isLoading} 
              selectedSlot={selectedSlot} 
              onSelectSlot={setSelectedSlot} 
              timezone={timezone}
            />
          </div>

          <div className="space-y-4">
            <AppointmentPreview 
              slot={selectedSlot} 
              durationMinutes={duration} 
              timezone={timezone} 
            />
            
            <Button 
              className="w-full" 
              size="lg" 
              disabled={!selectedSlot || isBooking}
              onClick={handleBookSlot}
            >
              {isBooking ? 'Booking...' : 'Book Selected Slot'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
