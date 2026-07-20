import { Text, Heading } from '@react-email/components';
import { BaseLayout } from '../layouts/BaseLayout';
import React from 'react';

export function AppointmentConfirmedEmail({ appointment, updates }: any) {
  return (
    <BaseLayout previewText="Your appointment is confirmed">
      <Heading>Appointment Confirmed</Heading>
      <Text>Your appointment has been successfully confirmed.</Text>
      <Text>
        <strong>Date &amp; Time:</strong> {new Date(appointment.start_time).toLocaleString()}
      </Text>
      {updates?.reason && (
        <Text>
          <strong>Note:</strong> {updates.reason}
        </Text>
      )}
    </BaseLayout>
  );
}
