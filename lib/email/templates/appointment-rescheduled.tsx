import { Text, Heading } from '@react-email/components';
import { BaseLayout } from '../layouts/BaseLayout';
import React from 'react';

export function AppointmentRescheduledEmail({ appointment, updates }: any) {
  return (
    <BaseLayout previewText="Your appointment has been rescheduled">
      <Heading>Appointment Rescheduled</Heading>
      <Text>Your appointment has been rescheduled to a new time.</Text>
      <Text>
        <strong>New Date &amp; Time:</strong> {new Date(updates.newStartTime).toLocaleString()}
      </Text>
      {updates?.reason && (
        <Text>
          <strong>Reason:</strong> {updates.reason}
        </Text>
      )}
    </BaseLayout>
  );
}
