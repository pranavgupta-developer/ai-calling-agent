'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { TestSession, TestMessage } from '../types/test-session';


export async function saveTestSession(
  sessionData: { agent_id: string; name: string },
  messages: TestMessage[]
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  let agencyId = null;
  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user.id)
    .single();
    
  if (agency) {
    agencyId = agency.id;
  } else {
    const { data: agencyUser } = await supabase
      .from('agency_users')
      .select('agency_id')
      .eq('auth_user_id', user.id)
      .single();
    if (agencyUser) {
      agencyId = agencyUser.agency_id;
    }
  }

  if (!agencyId) throw new Error('Agency not found');

  // Insert Session
  const { data: session, error: sessionError } = await supabase
    .from('agent_test_sessions')
    .insert({
      agency_id: agencyId,
      agent_id: sessionData.agent_id,
      name: sessionData.name,
    })
    .select()
    .single();

  if (sessionError) throw sessionError;

  // Prepare and insert messages
  if (messages.length > 0) {
    const formattedMessages = messages.map(m => ({
      session_id: session.id,
      role: m.role,
      content: m.content,
      name: m.name,
      tool_calls: m.tool_calls,
      tool_call_id: m.tool_call_id,
      developer_log: m.developer_log,
    }));

    const { error: messagesError } = await supabase
      .from('agent_test_messages')
      .insert(formattedMessages);

    if (messagesError) throw messagesError;
  }

  return session as TestSession;
}

export async function loadTestSessions(agentId: string) {
  const supabase = await createClient();
  const { data: sessions, error } = await supabase
    .from('agent_test_sessions')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return sessions as TestSession[];
}

export async function loadTestSessionMessages(sessionId: string) {
  const supabase = await createClient();
  const { data: messages, error } = await supabase
    .from('agent_test_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return messages as TestMessage[];
}

export async function deleteTestSession(sessionId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('agent_test_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) throw error;
  return true;
}
