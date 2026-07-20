'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentStatusSchema, appointmentSourceSchema, appointmentTypeSchema } from '@/lib/validations/appointments';
import { z } from 'zod';

const formSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  appointment_type: appointmentTypeSchema.default('consultation'),
  appointment_source: appointmentSourceSchema.default('dashboard'),
  status: appointmentStatusSchema.default('pending'),
  payment_status: z.string().default('unpaid'),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  duration_minutes: z.number().int().positive().default(30),
  client_notes: z.string().optional(),
});

type FormInput = z.infer<typeof formSchema>;
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AppointmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AppointmentForm({ onSuccess, onCancel }: AppointmentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState<string>('');

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: '',
      appointment_type: 'consultation',
      appointment_source: 'dashboard',
      status: 'pending',
      payment_status: 'unpaid',
      start_time: '',
      end_time: '',
      duration_minutes: 30,
      client_notes: '',
    },
  });

  const onSubmit = (data: any) => {
    startTransition(async () => {
      try {
        // Here we would call the server action, e.g., createAppointmentAction(data)
        // await createAppointmentAction(data);
        console.log('Submitting', data);
        toast.success('Appointment created successfully');
        onSuccess?.();
      } catch (error: any) {
        toast.error(error.message || 'Failed to create appointment');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control as any}
            name="client_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client ID (Placeholder)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Client ID or select..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="appointment_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Appointment Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="property_viewing">Property Viewing</SelectItem>
                    <SelectItem value="investment">Investment Discussion</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormItem>
             <FormLabel>Date</FormLabel>
             <FormControl>
               <Input 
                 type="date" 
                 value={selectedDate} 
                 onChange={(e) => setSelectedDate(e.target.value)} 
               />
             </FormControl>
          </FormItem>

          <FormField
            control={form.control as any}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time (ISO String Placeholder)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 2024-01-01T10:00:00Z" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control as any}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time (ISO String Placeholder)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 2024-01-01T10:30:00Z" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control as any}
          name="client_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any important notes for this appointment..."
                  className="resize-none h-24"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Appointment
          </Button>
        </div>
      </form>
    </Form>
  );
}
