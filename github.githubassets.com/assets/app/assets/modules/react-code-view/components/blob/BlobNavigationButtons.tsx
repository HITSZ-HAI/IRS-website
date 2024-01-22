import {useCurrentRepository} from '@github-ui/current-repository'
import {blamePath, blobPath} from '@github-ui/paths'
import {useNavigate} from '@github-ui/use-navigate'
import {Box, Dialog, LinkButton, TextInput} from '@primer/react'
import {useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'

// eslint-disable-next-line no-restricted-imports
import {parseFileAnchor} from '../../../github/blob-anchor'
import {useCurrentBlob} from '../../hooks/CurrentBlob'
import {useFilesPageInfo} from '../../hooks/FilesPageInfo'
import {useCursorEndLineNumber, useCursorStartLineNumber, useIsCursorEnabled} from '../../hooks/use-cursor-navigation'
import {scrollLineIntoView} from '../../hooks/use-scroll-line-into-view'
import {linkButtonSx} from '../../utilities/styles'

export function useWorkflowRedirectUrl() {
  const blobPayload = useCurrentBlob()
  return blobPayload.workflowRedirectUrl
}

export function GoToLineDialog({
  onBlamePage,
  onDismiss,
  maxLineNumber,
}: {
  onBlamePage: boolean
  onDismiss: () => void
  maxLineNumber?: number
}) {
  const navigate = useNavigate()
  const shouldUseCursor = useIsCursorEnabled()
  const startLineNum = useCursorStartLineNumber()
  const endLineNum = useCursorEndLineNumber()
  const lineNumber = useRef(shouldUseCursor ? startLineNum : 1)
  const valid = useRef(true)
  const [changeDescribeBy, setChangeDescribeBy] = useState(true)
  const secondLineNumber = useRef(startLineNum !== endLineNum && shouldUseCursor ? endLineNum : null)
  const {refInfo, path} = useFilesPageInfo()
  const repo = useCurrentRepository()
  const inputBoxRef = useRef<HTMLInputElement>(null)

  const hash = useRef(
    lineNumber.current
      ? `#L${lineNumber.current}${secondLineNumber.current ? `-L${secondLineNumber.current}` : ''}`
      : '',
  )
  const href = onBlamePage
    ? blamePath({
        repo: repo.name,
        owner: repo.ownerLogin,
        filePath: path,
        commitish: refInfo.name,
      })
    : blobPath({
        repo: repo.name,
        owner: repo.ownerLogin,
        filePath: path,
        commitish: refInfo.name,
      })

  useEffect(() => {
    if (inputBoxRef && inputBoxRef.current) {
      inputBoxRef.current.value = shouldUseCursor
        ? `${startLineNum}${endLineNum !== startLineNum ? `-${endLineNum}` : ''}`
        : '1'

      inputBoxRef.current.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleInputChange(inputValue: string) {
    let isValid = true
    if (inputValue.trim() === '') {
      lineNumber.current = 1
    }
    if (inputValue.startsWith('-') && maxLineNumber) {
      const intValue = parseInt(inputValue, 10)
      if (!Number.isNaN(intValue) && intValue < 0) {
        let numberToGoTo = maxLineNumber + intValue + 1
        if (numberToGoTo <= 0) {
          numberToGoTo = 1
          isValid = false
        }
        lineNumber.current = numberToGoTo
      }
    } else if (inputValue.includes('-')) {
      const [firstLine, secondLine] = inputValue.split('-')
      const firstIntValue = parseInt(firstLine!, 10)
      const secondIntvalue = parseInt(secondLine!, 10)
      if (!Number.isNaN(firstIntValue) && firstIntValue > 0) {
        lineNumber.current = maxLineNumber ? Math.min(firstIntValue, maxLineNumber) : firstIntValue
        isValid = maxLineNumber !== undefined && firstIntValue <= maxLineNumber
      }
      if (!Number.isNaN(secondIntvalue) && secondIntvalue > 0) {
        secondLineNumber.current = maxLineNumber ? Math.min(secondIntvalue, maxLineNumber) : secondIntvalue
        isValid = isValid && maxLineNumber !== undefined && secondIntvalue <= maxLineNumber
      }
    } else {
      const intValue = parseInt(inputValue, 10)
      if (!Number.isNaN(intValue) && intValue > 0) {
        lineNumber.current = maxLineNumber ? Math.min(intValue, maxLineNumber) : intValue
        isValid = maxLineNumber !== undefined && intValue <= maxLineNumber
      } else {
        isValid = inputValue !== '' ? false : true
      }
    }
    valid.current = isValid
    if (isValid && !changeDescribeBy) {
      setChangeDescribeBy(true)
    }
    //fix hitting enter on the input box updating even if it isn't valid
    hash.current = `#L${lineNumber.current}${secondLineNumber.current ? `-L${secondLineNumber.current}` : ''}`
  }

  const handleGoToLine = (newHash: string) => {
    const anchInfo = parseFileAnchor(newHash)
    if (!anchInfo.blobRange?.start?.line || !valid.current) {
      setChangeDescribeBy(valid.current)
      setTimeout(() => {
        inputBoxRef.current?.focus()
      }, 25)
      return
    }
    scrollLineIntoView({line: anchInfo.blobRange.start.line})

    onDismiss()
  }

  //creating a portal because there were z-index conflicts which are resolved by creating a portal for the dialog
  //TODO: change the 'Go' linkbutton below back to a button with 'as="a"' once the primer react bug is fixed
  return createPortal(
    <Dialog isOpen onDismiss={onDismiss}>
      <Box>
        <Dialog.Header>Jump to line</Dialog.Header>
        <Box sx={{display: 'flex', pl: 3, pr: 3, pt: 3, pb: changeDescribeBy ? 3 : 0}}>
          <Box sx={{display: 'flex', flexGrow: 1, mr: 2}}>
            <TextInput
              ref={inputBoxRef}
              aria-invalid={!changeDescribeBy}
              aria-describedby={changeDescribeBy ? '' : 'goToLineErrorValidation'}
              sx={{flexGrow: 1, pr: 2}}
              placeholder="Jump to line..."
              onChange={e => {
                const value = e.target.value
                if (inputBoxRef && inputBoxRef.current) {
                  inputBoxRef.current.value = value
                }
                handleInputChange(value)
              }}
              onFocus={() => {
                if (inputBoxRef && inputBoxRef.current) {
                  inputBoxRef.current.select()
                }
              }}
              onKeyDown={e => {
                // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
                if (e.key !== 'Enter') return
                // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
                if (e.key === 'Enter' && !valid.current) {
                  setChangeDescribeBy(valid.current)
                  setTimeout(() => {
                    inputBoxRef.current?.focus()
                  }, 25)
                  return
                }
                // update our url and trigger any necessary changes on path/hash change (namely highlighting)
                navigate(href + hash.current)
                // hash changes don't automatically scroll to the line as of #252468
                handleGoToLine(hash.current)
              }}
            />
          </Box>
          <LinkButton
            href={changeDescribeBy ? href + hash.current : undefined}
            onClick={() => handleGoToLine(hash.current)}
            sx={linkButtonSx}
          >
            Go
          </LinkButton>
        </Box>
        {!changeDescribeBy && (
          <Box
            role="alert"
            id="goToLineErrorValidation"
            sx={{display: 'flex', p: 2, justifyContent: 'center', color: 'red'}}
          >
            Invalid line number
          </Box>
        )}
      </Box>
    </Dialog>,
    document.body,
  )
}

try{ GoToLineDialog.displayName ||= 'GoToLineDialog' } catch {}