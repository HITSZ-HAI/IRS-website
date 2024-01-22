import type {Icon as PrimerIcon} from '@primer/octicons-react'
import {Box, CircleOcticon, Heading, Text} from '@primer/react'
import type React from 'react'

/**
 * This collection of components creates a consistent UI for the branch info bar.
 * Once can compose the layout in the following way:
 *
 * <PopoverContainer>
 *  <PopoverIcon>
 *   <Icon />
 *  </PopoverIcon>
 *  <PopoverContent
 *    icon={<PopoverIcon icon={AlertIcon} bg="neutral.emphasis" />}
 *    header={<Text>Popup header</Text>}
 *    content={<Text>Content of the popup</Text>}
 *  />
 *  <PopoverActionContainer>
 *   <Button>Discard</Button>
 *   <Button as={Link} sx={{flex: 1, ...linkButtonSx}}>Update</Button>
 *  </PopoverActionContainer>
 * </PopoverContainer>
 *
 */
export function PopoverContainer({children}: {children: React.ReactNode}) {
  return (
    <Box className={'popover-container-width'} sx={{borderRadius: 6, minWidth: 250}}>
      {children}
    </Box>
  )
}

interface PopoverContentProps {
  icon: React.ReactNode
  header: React.ReactNode
  content: React.ReactNode
}

export function PopoverContent({icon, header, content}: PopoverContentProps) {
  return (
    <Box sx={{display: 'flex', p: 3}}>
      <Box sx={{mr: 2}}>{icon}</Box>
      <Box>
        <Heading as="h2" sx={{fontSize: 1, mb: 1}}>
          {header}
        </Heading>
        <Text sx={{color: 'fg.muted', fontSize: 0}}>{content}</Text>
      </Box>
    </Box>
  )
}

interface PopoverIconProps {
  bg: string
  icon: PrimerIcon
}
export function PopoverIcon({icon: IconComponent, bg}: PopoverIconProps) {
  return <CircleOcticon sx={{bg, color: 'fg.onEmphasis'}} size={30} icon={() => <IconComponent size={16} />} />
}

export function PopoverActions({children}: {children: React.ReactNode}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        p: 3,
        justifyContent: 'space-between',
        borderTop: 'solid 1px',
        borderColor: 'border.muted',
        gap: 3,
      }}
    >
      {children}
    </Box>
  )
}

try{ PopoverContainer.displayName ||= 'PopoverContainer' } catch {}
try{ PopoverContent.displayName ||= 'PopoverContent' } catch {}
try{ PopoverIcon.displayName ||= 'PopoverIcon' } catch {}
try{ PopoverActions.displayName ||= 'PopoverActions' } catch {}