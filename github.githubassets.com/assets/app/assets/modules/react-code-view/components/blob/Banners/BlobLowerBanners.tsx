import type {CodeownersError, SplitCodeownersError} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {SafeHTMLBox, type SafeHTMLString} from '@github-ui/safe-html'
import {Flash, Link} from '@primer/react'
import {useEffect, useRef, useState} from 'react'

import SplitCodeownersErrorsContext from '../../../contexts/SplitCodeownersErrorsContext'
import {useCurrentBlob} from '../../../hooks/CurrentBlob'
import {useFilesPageInfo} from '../../../hooks/FilesPageInfo'
import PublishBanners from '../../overview/banners/PublishBanners'
import {
  CodeownerFileBanner,
  CodeOwnerValidationState,
  fetchCodeownersValidity,
  splitCodeownersError,
} from './CodeownerFileBanner'
import {DiscussionTemplateBanner} from './DiscussionTemplateBanner'
import {IssueTemplateBanner} from './IssueTemplateBanner'

export default function BlobLowerBanners() {
  const repo = useCurrentRepository()
  const {refInfo, path} = useFilesPageInfo()
  const {
    csvError,
    isCodeownersFile,
    publishBannersInfo: {
      showPublishActionBanner,
      showPublishStackBanner,
      releasePath,
      dismissActionNoticePath,
      dismissStackNoticePath,
    },
    discussionTemplate,
  } = useCurrentBlob()

  const [splitCodeownersErrors, setSplitCodeownersErrors] = useState<SplitCodeownersError[]>([])
  const [codeownersValidationState, setCodeownersValidationState] = useState<CodeOwnerValidationState>(
    CodeOwnerValidationState.LOADING,
  )

  // Counter used to track the number of times we send off this request so if anything changes while we are waiting
  // we can throw away the old result
  const counterRef = useRef(0)
  useEffect(() => {
    counterRef.current++
    const loadCodeownersErrors = async () => {
      try {
        const currentVal = counterRef.current
        const result = await fetchCodeownersValidity(repo, refInfo, path)

        // The results are from a previous request so we can ignore them
        if (currentVal < counterRef.current) {
          return
        }

        if (result.ok) {
          const data = await result.json()
          setSplitCodeownersErrors(data.map((error: CodeownersError) => splitCodeownersError(error)))
          setCodeownersValidationState(CodeOwnerValidationState.VALIDATED)
        } else {
          setCodeownersValidationState(CodeOwnerValidationState.ERROR)
        }
      } catch (e) {
        setCodeownersValidationState(CodeOwnerValidationState.ERROR)
      }
    }
    if (isCodeownersFile) {
      loadCodeownersErrors()
    }
  }, [isCodeownersFile, repo, refInfo, path])

  return (
    <>
      <PublishBanners
        showPublishActionBanner={showPublishActionBanner}
        showPublishStackBanner={showPublishStackBanner}
        releasePath={releasePath}
        dismissActionNoticePath={dismissActionNoticePath}
        dismissStackNoticePath={dismissStackNoticePath}
      />
      <IssueTemplateBanner />
      {discussionTemplate?.errors && discussionTemplate.errors.length > 0 && (
        <DiscussionTemplateBanner {...discussionTemplate} />
      )}
      <TruncatedBanner />
      {isCodeownersFile && (
        <SplitCodeownersErrorsContext.Provider value={splitCodeownersErrors}>
          <CodeownerFileBanner errors={splitCodeownersErrors} state={codeownersValidationState} />
        </SplitCodeownersErrorsContext.Provider>
      )}
      {csvError && <CSVErrorBanner csvError={csvError} />}
    </>
  )
}

function TruncatedBanner() {
  const {truncated, large, image, renderedFileInfo, rawBlobUrl} = useCurrentBlob()

  return truncated && !large && !(image || renderedFileInfo) ? (
    <Flash sx={{mt: 3}}>
      This file has been truncated, but you can <Link href={rawBlobUrl}>view the full file</Link>.
    </Flash>
  ) : null
}

function CSVErrorBanner({csvError}: {csvError: SafeHTMLString}) {
  return (
    <Flash sx={{mt: 3}} variant="warning">
      <SafeHTMLBox html={csvError} />
    </Flash>
  )
}

try{ BlobLowerBanners.displayName ||= 'BlobLowerBanners' } catch {}
try{ TruncatedBanner.displayName ||= 'TruncatedBanner' } catch {}
try{ CSVErrorBanner.displayName ||= 'CSVErrorBanner' } catch {}