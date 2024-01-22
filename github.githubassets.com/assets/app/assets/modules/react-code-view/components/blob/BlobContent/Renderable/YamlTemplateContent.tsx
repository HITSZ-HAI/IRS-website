import type {TemplateFormInput, YamlTemplate} from '@github-ui/code-view-types'
import {SafeHTMLBox} from '@github-ui/safe-html'
import {
  ActionList,
  ActionMenu,
  Box,
  Checkbox,
  CheckboxGroup,
  FormControl,
  type SxProp,
  Textarea,
  TextInput,
} from '@primer/react'
import type {PropsWithChildren} from 'react'

export enum YamlTemplateType {
  Issue = 'issue',
  Discussion = 'discussion',
}

export function YamlTemplateContent({issueTemplate, type}: {issueTemplate: YamlTemplate; type: YamlTemplateType}) {
  return (
    <Box sx={{borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px', p: 5}}>
      <Box as="table" sx={{mb: 3}}>
        <thead>
          <tr>
            {type === YamlTemplateType.Issue ? (
              <>
                <MarkdownTableCell header>Name</MarkdownTableCell>
                <MarkdownTableCell header>About</MarkdownTableCell>
              </>
            ) : (
              <MarkdownTableCell header>Title</MarkdownTableCell>
            )}
            {issueTemplate.type && <MarkdownTableCell header>Type</MarkdownTableCell>}
            <MarkdownTableCell header>Labels</MarkdownTableCell>
            {issueTemplate.projects && <MarkdownTableCell header>Projects</MarkdownTableCell>}

            {type === YamlTemplateType.Issue && <MarkdownTableCell header>Assignees</MarkdownTableCell>}
          </tr>
        </thead>
        <tbody>
          <tr>
            {type === YamlTemplateType.Issue ? (
              <>
                <MarkdownTableCell>{issueTemplate.name}</MarkdownTableCell>
                <MarkdownTableCell>{issueTemplate.about}</MarkdownTableCell>
              </>
            ) : (
              <MarkdownTableCell>{issueTemplate.title}</MarkdownTableCell>
            )}
            {issueTemplate.type && <MarkdownTableCell>{issueTemplate.type}</MarkdownTableCell>}
            <MarkdownTableCell>{issueTemplate.labels}</MarkdownTableCell>
            {issueTemplate.projects && <MarkdownTableCell>{issueTemplate.projects}</MarkdownTableCell>}

            {type === YamlTemplateType.Issue && <MarkdownTableCell>{issueTemplate.assignees}</MarkdownTableCell>}
          </tr>
        </tbody>
      </Box>
      {issueTemplate.inputs.map((input, index) => (
        <TemplateInput key={index} input={input} />
      ))}
    </Box>
  )
}

function MarkdownTableCell({children, header}: PropsWithChildren<{header?: boolean}>) {
  return (
    <Box
      as={header ? 'th' : 'td'}
      sx={{
        p: '6px 13px',
        border: '1px solid var(--borderColor-default, var(--color-border-default))',
      }}
    >
      {children}
    </Box>
  )
}

function TemplateInput({input}: {input: TemplateFormInput}): JSX.Element | null {
  switch (input.type) {
    case 'markdown':
      return <MarkdownInput input={input} />
    case 'dropdown':
      return <DropdownInput input={input} />
    case 'input':
      return <InputInput input={input} />
    case 'textarea':
      return <TextareaInput input={input} />
    case 'checkboxes':
      return <CheckboxesInput input={input} />
    default:
      return null
  }
}

// TODO: Get html from markdown
function MarkdownInput({input}: {input: TemplateFormInput}) {
  if (!input.value) return null
  return <SafeHTMLBox html={input.value} />
}

function DropdownInput({input}: {input: TemplateFormInput}) {
  const options = input.options?.slice()

  if (!input.required) {
    options?.unshift('None')
  }

  let buttonText = input.multiple ? 'Selections: ' : 'Selection: '

  if (input.value) {
    buttonText += input.value
  }

  return (
    <InputWrapper input={input} sx={{alignItems: 'start'}}>
      <ActionMenu>
        <ActionMenu.Button>{buttonText}</ActionMenu.Button>
        <ActionMenu.Overlay width="medium">
          <ActionList selectionVariant={input.multiple ? 'multiple' : 'single'}>
            {options?.map((option, index) => (
              <ActionList.Item key={index} selected={option === input.value} disabled={true}>
                {option}
              </ActionList.Item>
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </InputWrapper>
  )
}

function InputInput({input}: {input: TemplateFormInput}) {
  return (
    <InputWrapper input={input}>
      <TextInput placeholder={input.placeholder} value={input.value ?? ''} />
    </InputWrapper>
  )
}

/**
 * Since the blob viewer version is read only, we don't need the functionality to preserve content
 * when switching to preview and on navigation.
 */
function TextareaInput({input}: {input: TemplateFormInput}) {
  return (
    <InputWrapper input={input}>
      <Textarea
        placeholder={input.placeholder}
        value={input.value ?? ''}
        sx={input.render ? {fontFamily: 'mono'} : {}}
      />
    </InputWrapper>
  )
}

function CheckboxesInput({input}: {input: TemplateFormInput}) {
  if (!input.checkboxes) {
    return null
  }

  return (
    <CheckboxGroup
      disabled={true}
      sx={{
        color: 'var(--fgColor-default, var(--color-fg-default)) !important',
        my: '15px',
      }}
    >
      <CheckboxGroup.Label
        sx={{
          color: 'var(--fgColor-default, var(--color-fg-default))',
          fontSize: ['18px', '18x', '20px'],
          fontWeight: 600,
        }}
      >
        {input.label}
      </CheckboxGroup.Label>
      {input.description && (
        <CheckboxGroup.Caption sx={{color: 'var(--fgColor-muted, var(--color-fg-subtle))', fontSize: '12px'}}>
          <SafeHTMLBox html={input.description} />
        </CheckboxGroup.Caption>
      )}
      {input.checkboxes.map((checkbox, index) => (
        <FormControl disabled={true} key={index} required={checkbox.required}>
          <Checkbox />
          <FormControl.Label>{checkbox.label}</FormControl.Label>
        </FormControl>
      ))}
    </CheckboxGroup>
  )
}

function InputWrapper({children, input, sx}: PropsWithChildren<{input: TemplateFormInput}> & SxProp) {
  return (
    <FormControl
      disabled
      required={input.required}
      sx={{
        my: '15px',
        ...sx,
      }}
    >
      <FormControl.Label
        sx={{
          color: 'var(--fgColor-default, var(--color-fg-default))',
          fontSize: ['18px', '18x', '20px'],
          // Color the required asterisk
          '> span > span:last-of-type': {color: 'var(--fgColor-danger, var(--color-danger-fg))'},
        }}
      >
        {input.label}
      </FormControl.Label>
      {input.description && (
        <FormControl.Caption>
          <SafeHTMLBox html={input.description} />
        </FormControl.Caption>
      )}
      {children}
    </FormControl>
  )
}

try{ YamlTemplateContent.displayName ||= 'YamlTemplateContent' } catch {}
try{ MarkdownTableCell.displayName ||= 'MarkdownTableCell' } catch {}
try{ TemplateInput.displayName ||= 'TemplateInput' } catch {}
try{ MarkdownInput.displayName ||= 'MarkdownInput' } catch {}
try{ DropdownInput.displayName ||= 'DropdownInput' } catch {}
try{ InputInput.displayName ||= 'InputInput' } catch {}
try{ TextareaInput.displayName ||= 'TextareaInput' } catch {}
try{ CheckboxesInput.displayName ||= 'CheckboxesInput' } catch {}
try{ InputWrapper.displayName ||= 'InputWrapper' } catch {}