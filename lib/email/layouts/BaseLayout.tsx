import { Html, Head, Body, Container, Section, Text, Preview } from '@react-email/components';
import React from 'react';

export function BaseLayout({ children, previewText }: { children: React.ReactNode, previewText: string }) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            {children}
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              Powered by AI Real Estate SaaS
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px', borderRadius: '5px', marginTop: '40px' };
const content = { padding: '20px' };
const footer = { padding: '20px', textAlign: 'center' as const };
const footerText = { color: '#8898aa', fontSize: '12px' };
