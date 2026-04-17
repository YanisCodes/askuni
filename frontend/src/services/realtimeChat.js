import supabase from './supabase'

export function subscribeToChat(sessionId, onMessage) {
  const channel = supabase
    .channel(`chat-session-${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        onMessage(payload.new)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export async function uploadChatFile(file, sessionId) {
  const ext = file.name.split('.').pop()
  const path = `sessions/${sessionId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { data, error } = await supabase.storage
    .from('chat-files')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('chat-files')
    .getPublicUrl(data.path)

  return { url: urlData.publicUrl, fileName: file.name }
}
