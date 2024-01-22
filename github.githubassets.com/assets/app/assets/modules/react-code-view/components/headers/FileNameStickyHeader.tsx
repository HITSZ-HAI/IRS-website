import {ArrowUpIcon} from '@primer/octicons-react'
import {Box, Button, type ButtonProps} from '@primer/react'

import {ReposHeaderBreadcrumb} from './ReposHeaderBreadcrumb'
import {ReposHeaderRefSelector} from './ReposHeaderRefSelector'

export default function FileNameStickyHeader({
  isStickied,
  showTree,
  treeToggleElement,
}: {
  isStickied: boolean
  showTree: boolean
  treeToggleElement: JSX.Element | null
}) {
  const stickySx = isStickied
    ? {
        backgroundColor: 'canvas.subtle',
        borderLeft: '1px solid var(--borderColor-default, var(--color-border-default))',
        borderRight: '1px solid var(--borderColor-default, var(--color-border-default))',
      }
    : {}

  const StickyReposHeaderBreadcrumb = () => {
    // additional ids to create unique ids for axe
    return <ReposHeaderBreadcrumb id="sticky-breadcrumb" fileNameId="sticky-file-name-id" fontSize={1} />
  }

  const GoToTopButton = ({sx}: {sx?: ButtonProps['sx']}) => {
    return (
      <Button
        leadingVisual={ArrowUpIcon}
        variant="invisible"
        size="small"
        sx={{color: 'fg.default', ...sx}}
        onClick={event => {
          event.preventDefault()
          window.scrollTo({top: 0, behavior: 'smooth'})
        }}
      >
        Top
      </Button>
    )
  }

  return (
    <Box
      sx={{
        display: isStickied ? 'flex' : 'none',
        minWidth: 0,
        py: 2,
        ...stickySx,
      }}
    >
      {!showTree ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            mx: 2,
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            {isStickied && treeToggleElement}
            <Box sx={{ml: 1, mr: 2}}>
              <ReposHeaderRefSelector buttonClassName="ref-selector-class" />
            </Box>
            <Box
              sx={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                display: 'flex',
              }}
            >
              <StickyReposHeaderBreadcrumb />
            </Box>
          </Box>
          <GoToTopButton sx={{ml: 2}} />
        </Box>
      ) : (
        <Box
          sx={{
            mr: 2,
            ml: 3,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <StickyReposHeaderBreadcrumb />
          <GoToTopButton sx={{ml: 2}} />
        </Box>
      )}
    </Box>
  )
}

try{ FileNameStickyHeader.displayName ||= 'FileNameStickyHeader' } catch {}
try{ StickyReposHeaderBreadcrumb.displayName ||= 'StickyReposHeaderBreadcrumb' } catch {}
try{ GoToTopButton.displayName ||= 'GoToTopButton' } catch {}