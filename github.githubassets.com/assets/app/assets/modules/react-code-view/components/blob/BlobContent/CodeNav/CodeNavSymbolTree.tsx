import type {CodeSymbol, TreeNode} from '@github-ui/code-nav'
import {Box, Text, TreeView, Truncate} from '@primer/react'
import React, {useState} from 'react'

import {SymbolIndicator} from './SymbolIndicator'

export const CodeNavSymbolTree = React.memo(function CodeNavSymTree({
  treeSymbols,
  onTreeSymbolSelect,
}: {
  treeSymbols: TreeNode[]
  onTreeSymbolSelect: (sym: CodeSymbol) => void
}) {
  const isFlatTree = !treeSymbols.some(node => node.isParent || node.children.length > 0)

  return (
    <Box id="filter-results" sx={{mb: -2, overflowY: 'auto', maxHeight: 'calc(100vh - 237px)', pl: 3, pb: 2, pt: 1}}>
      <TreeView aria-label="Code Navigation" flat={isFlatTree}>
        {treeSymbols.map((s, idx) => (
          <CodeNavTreeItem
            key={`${idx}${s.symbol.name}`}
            id={`${idx}${s.symbol.name}`}
            symbol={s}
            depth={s.isParent ? 1 : 2}
            onSelect={onTreeSymbolSelect}
          />
        ))}
      </TreeView>
    </Box>
  )
})

function CodeNavTreeContent({symbol}: {symbol: TreeNode}) {
  return (
    <Box sx={{display: 'flex'}}>
      <SymbolIndicator symbolKind={symbol.symbol.kind} />
      {
        // space for screen reader to read out text correctly
        '  '
      }
      <Truncate title={symbol.symbol.name} sx={{maxWidth: 180, display: 'block'}}>
        <Text>{symbol.symbol.name}</Text>
      </Truncate>
    </Box>
  )
}
function CodeNavTreeItem({
  symbol,
  depth,
  onSelect,
  id,
}: {
  symbol: TreeNode
  depth: number
  onSelect: (sym: CodeSymbol) => void
  id: string
}) {
  //Only expanding the first few levels of the tree by default, we add 2 each time to the depth because it pushes
  //the elements further to the right in the UI, hence using 7 here as the depth check
  const [isExpanded, setIsExpanded] = useState(depth <= 7)

  return (
    <TreeView.Item
      onSelect={() => onSelect(symbol.symbol)}
      expanded={isExpanded}
      onExpandedChange={() => setIsExpanded(!isExpanded)}
      id={id}
    >
      <CodeNavTreeContent symbol={symbol} />

      {symbol.isParent && symbol.children.length > 0 && (
        <TreeView.SubTree>
          {symbol.children.map((childSymbol, index) => {
            return (
              <CodeNavTreeItem
                symbol={childSymbol}
                depth={childSymbol.isParent ? depth + 1 : depth}
                onSelect={onSelect}
                key={`${index}${childSymbol.symbol.name}`}
                id={`${index}${childSymbol.symbol.name}`}
              />
            )
          })}
        </TreeView.SubTree>
      )}
    </TreeView.Item>
  )
}

try{ CodeNavSymbolTree.displayName ||= 'CodeNavSymbolTree' } catch {}
try{ CodeNavTreeContent.displayName ||= 'CodeNavTreeContent' } catch {}
try{ CodeNavTreeItem.displayName ||= 'CodeNavTreeItem' } catch {}