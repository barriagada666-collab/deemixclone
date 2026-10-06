import React, { useState } from 'react';
import {
  AlertCircle,
  Archive,
  ArrowDownToLine,
  CheckCircle2,
  FileAudio,
  FolderDown,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Trash2,
  Volume2,
  Wrench,
  X
} from 'lucide-react';
import { downloadManager } from '../services/downloadManager';
import { DownloadItem, DownloadStatus, Track } from '../types';
import { ArtworkVisual } from './ArtworkVisual';

interface DownloadQueueViewProps {
  queue: DownloadItem[];
  onPlayTrack: (track: Track) => void;
  onOpenAccountModal: () => void;
}

export const DownloadQueueView: React.FC<DownloadQueueViewProps> = ({
  queue,
  onPlayTrack,
  onOpenAccountModal
}) => {
  const [isExportingZip, setIsExportingZip] = useState(false);

  const activeCount = queue.filter(q => q.status === 'downloading' || q.status === 'tagging').length;
  const completedCount = queue.filter(q => q.status === 'completed').length;
  const failedCount = queue.filter(q => q.status === 'failed').length;

  const handleExportZip = async () => {
    setIsExportingZip(true);
    try {
      await downloadManager.exportAllCompletedZip();
    } finally {
      setIsExportingZip(false);
    }
  };

  const formatSpeed = (bps: number) => {
    if (!bps || bps <= 0) return '0.0 MB/s';
    const mbps = bps / (1024 * 1024);
    return `${mbps.toFixed(1)} MB/s`;
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status: DownloadStatus) => {
    switch (status) {
      case 'downloading':
        return (
          <span className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px] font-semibold">
            <Loader2 className="w-3 h-3 animate-spin" /> Downloading
          </span>
        );
      case 'tagging':
        return (
          <span className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px] font-semibold">
            <Loader2 className="w-3 h-3 animate-spin" /> Injecting ID3/FLAC Tags
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px] font-semibold">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'paused':
        return (
          <span className="text-neutral-400 font-mono text-[11px]">
            Paused
          </span>
        );
      case 'queued':
        return (
          <span className="text-neutral-500 font-mono text-[11px]">
            Queued
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-rose-400 font-mono text-[11px] font-semibold">
            <AlertCircle className="w-3 h-3" /> Failed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Queue Control Header */}
      <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display font-black text-2xl text-neutral-100">Download Queue</h2>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
              {queue.length} Total
            </span>
          </div>
          <p className="text-xs text-neutral-400 font-mono">
            {activeCount} active · {completedCount} completed · Lossless 1411kbps FLAC Engine
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {completedCount > 0 && (
            <button
              onClick={handleExportZip}
              disabled={isExportingZip}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-all shadow"
              title="Save all completed tracks in a single ZIP bundle with folder structure, covers, and synced lyrics"
            >
              {isExportingZip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
              <span>Export All to ZIP ({completedCount})</span>
            </button>
          )}

          {failedCount > 0 && (
            <button
              onClick={() => downloadManager.retryAllFailed()}
              className="px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Failed ({failedCount})</span>
            </button>
          )}

          {completedCount > 0 && (
            <button
              onClick={() => downloadManager.clearCompleted()}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Done</span>
            </button>
          )}
        </div>
      </div>

      {/* Queue List */}
      {queue.length > 0 ? (
        <div className="space-y-3">
          {queue.map(item => {
            const isCompleted = item.status === 'completed';
            const isDownloading = item.status === 'downloading' || item.status === 'tagging';

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/90 shadow-sm space-y-3 transition-colors hover:border-neutral-700"
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Track info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <ArtworkVisual gradient={item.track.coverGradient} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-neutral-100 truncate">
                          {item.track.title}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-cyan-400 border border-neutral-700">
                          {item.quality}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate">
                        {item.track.artist} · {item.track.album}
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div>{getStatusBadge(item.status)}</div>

                    {isCompleted ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onPlayTrack(item.track)}
                          className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-cyan-400 transition-colors"
                          title="Play Track"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => downloadManager.triggerDirectDownload(item)}
                          className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 transition-all font-bold"
                          title="Save single file to disk"
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : item.status === 'paused' ? (
                      <button
                        onClick={() => downloadManager.resumeDownload(item.id)}
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                        title="Resume"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    ) : item.status === 'downloading' ? (
                      <button
                        onClick={() => downloadManager.pauseDownload(item.id)}
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                        title="Pause"
                      >
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    ) : null}

                    <button
                      onClick={() => downloadManager.cancelDownload(item.id)}
                      className="p-2 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                      title="Remove from queue"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Real-time Metrics */}
                <div className="space-y-1.5">
                  <div className="w-full h-2 rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
                    <div
                      className={`h-full transition-all duration-150 ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : item.status === 'tagging'
                          ? 'bg-amber-400'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <div className="flex items-center gap-3">
                      <span>
                        {formatBytes(item.downloadedBytes)} / {formatBytes(item.totalBytes)} ({item.progress}%)
                      </span>
                      {isDownloading && (
                        <span className="text-cyan-400 font-semibold">{formatSpeed(item.speedBps)}</span>
                      )}
                    </div>
                    <div>
                      {isDownloading && item.etaSeconds > 0 && (
                        <span>ETA: {item.etaSeconds}s</span>
                      )}
                      {isCompleted && (
                        <span className="text-neutral-500">{item.fileName}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center text-neutral-500 space-y-3 bg-neutral-900/30 border border-neutral-800/60 rounded-3xl">
          <ArrowDownToLine className="w-12 h-12 mx-auto text-neutral-700" />
          <h3 className="font-display font-bold text-base text-neutral-300">Download queue is empty</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Browse albums and tracks, or paste a Deezer/Spotify link in the search bar to start lossless batch downloading.
          </p>
        </div>
      )}
    </div>
  );
};
