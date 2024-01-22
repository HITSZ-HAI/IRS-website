import {FileIcon} from '@primer/octicons-react'
import {Box} from '@primer/react'

interface Props {
  uploadUrl: string
}

export function Dropzone({uploadUrl}: Props) {
  return (
    <div
      className="repo-file-upload-tree-target js-document-dropzone js-upload-manifest-tree-view"
      data-testid="dragzone"
      data-drop-url={uploadUrl}
    >
      <div className="repo-file-upload-outline">
        <div className="repo-file-upload-slate">
          <Box sx={{color: 'fg.muted'}}>
            <FileIcon size={32} />
          </Box>
          <h2 aria-hidden="true">Drop to upload your files</h2>
        </div>
      </div>
    </div>
  )
}

try{ Dropzone.displayName ||= 'Dropzone' } catch {}