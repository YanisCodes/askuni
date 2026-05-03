export default function VideoGrid({ currentUser, localStream, remoteStreams, participants }) {
  const remoteEntries = Object.entries(remoteStreams)
  // Ensure the displayList has the current user first
  const displayList = []
  
  if (currentUser) {
    displayList.push(currentUser)
  }

  // Add all other participants
  participants?.forEach(p => {
    if (p.id !== currentUser?.id) {
      displayList.push(p)
    }
  })

  // Add anyone else we have a stream for (fallback)
  remoteEntries.forEach(([peerId, stream]) => {
    const match = peerId.match(/^askuni-(\d+)-/)
    if (match) {
      const uId = parseInt(match[1])
      if (!displayList.find(p => p.id === uId)) {
        displayList.push({ id: uId, name: `User ${uId}` })
      }
    }
  })

  const totalStreams = displayList.length || 1

  const gridCols = totalStreams <= 1
    ? 'grid-cols-1'
    : totalStreams <= 2
      ? 'grid-cols-2'
      : totalStreams <= 4
        ? 'grid-cols-2'
        : 'grid-cols-3'

  return (
    <div className={`grid ${gridCols} gap-3 h-full`}>
      {displayList.length === 0 && (
        <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
          <p className="text-slate-500 font-medium">Waiting for participants...</p>
        </div>
      )}

      {displayList.map(p => {
        const isMe = p.id === currentUser?.id
        
        let stream = null
        if (isMe) {
          stream = localStream
        } else {
          const streamEntry = remoteEntries.find(([peerId]) => {
            const match = peerId.match(/^askuni-(\d+)-/)
            return match && parseInt(match[1], 10) === p.id
          })
          if (streamEntry) stream = streamEntry[1]
        }

        return (
          <div key={p.id} className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video flex flex-col items-center justify-center">
            {stream ? (
              <video
                autoPlay
                playsInline
                muted={isMe} // always mute our own playback
                ref={(el) => {
                  // Only swap srcObject when the stream actually changes —
                  // re-assigning the same stream on every render reinitializes
                  // the element and causes the camera feed to flicker.
                  if (el && el.srcObject !== stream) el.srcObject = stream
                }}
                className={`w-full h-full object-cover ${isMe ? 'mirror' : ''}`}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-xl font-bold text-slate-400">
                  {p.name ? p.name.charAt(0).toUpperCase() : '?'}
                </div>
                <p className="text-slate-400 font-medium">{p.name || 'Participant'}</p>
              </div>
            )}
            
            <div className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)]">
              <div className="px-2 py-1 rounded-lg text-xs font-medium bg-black/50 text-white backdrop-blur-sm truncate">
                {isMe ? `${p.name || 'You'} (You)` : (p.name || 'Participant')}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
