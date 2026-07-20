import { Text, Heading } from '@react-email/components';
import { BaseLayout } from '../layouts/BaseLayout';
import React from 'react';

export function AppointmentCancelledEmail({ appointment, updates }: any) {
  return (
    <BaseLayout previewText="Your appointment has been cancelled">
      <Heading>Appointment Cancelled</Heading>
      <Text>Your appointment scheduled for {new Date(appointment.start_time).toLocaleString()} has been cancelled.</Text>
      {updates?.reason && (
        <Text>
          <strong>Reason:</strong> {updates.reason}
        </Text>
      )}
    </BaseLayout>
  );
}
