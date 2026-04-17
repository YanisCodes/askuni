export default function VideoGrid({ localStream, remoteStreams, participants }) {
  const remoteEntries = Object.entries(remoteStreams)
  const totalStreams = (localStream ? 1 : 0) + remoteEntries.length

  const gridCols = totalStreams <= 1
    ? 'grid-cols-1'
    : totalStreams <= 2
      ? 'grid-cols-2'
      : totalStreams <= 4
        ? 'grid-cols-2'
        : 'grid-cols-3'

  return (
    <div className={`grid ${gridCols} gap-3 h-full`}>
      {localStream && (
        <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video">
          <video
            autoPlay
            playsInline
            muted
            ref={(el) => {
              if (el) el.srcObject = localStream
            }}
            className="w-full h-full object-cover mirror"
          />
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
            You
          </div>
        </div>
      )}

      {remoteEntries.map(([peerId, stream]) => {
        const participant = participants?.find(
          (p) => peerId.includes(`-${p.id}-`)
        )
        return (
          <div key={peerId} className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video">
            <video
              autoPlay
              playsInline
              ref={(el) => {
                if (el) el.srcObject = stream
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
              {participant?.name || 'Participant'}
            </div>
          </div>
        )
      })}
    </div>
  )
}
