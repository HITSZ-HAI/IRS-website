import safeStorage from '@github-ui/safe-storage'
import {type CodeViewOption, useCodeViewOptions} from '@github-ui/use-code-view-options'
import {CheckIcon} from '@primer/octicons-react'
import {ActionList} from '@primer/react'
import {useCallback} from 'react'

const safeLocalStorage = safeStorage('localStorage')

export default function SettingsMenuItems() {
  const {codeFoldingOption, codeWrappingOption, codeCenterOption, openSymbolsOption} = useCodeViewOptions()

  return (
    <>
      <OptionsElement option={codeFoldingOption} />
      <OptionsElement option={codeWrappingOption} />
      <OptionsElement option={codeCenterOption} />
      <OptionsElement option={openSymbolsOption} />
    </>
  )
}

export function OptionsElement({option}: {option: CodeViewOption}) {
  const onSelect = useCallback(() => {
    option.setEnabled(!option.enabled)
    safeLocalStorage.setItem(option.name, String(!option.enabled))
  }, [option])

  return (
    <ActionList.Item key={option.name} onSelect={onSelect}>
      <ActionList.LeadingVisual>{option.enabled && <CheckIcon />}</ActionList.LeadingVisual>
      {option.label}
    </ActionList.Item>
  )
}

try{ SettingsMenuItems.displayName ||= 'SettingsMenuItems' } catch {}
try{ OptionsElement.displayName ||= 'OptionsElement' } catch {}