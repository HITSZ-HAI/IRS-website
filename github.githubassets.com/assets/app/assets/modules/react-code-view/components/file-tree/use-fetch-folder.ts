import type {DirectoryItem} from '@github-ui/code-view-types'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useSafeTimeout} from '@primer/react'
import React from 'react'

import type {TreeItem} from '../../../react-shared/Tree'
import type {dispatchKnownFoldersFunction} from '../../contexts/FileTreeContext'

type FetchFolderResult = [
  () => Promise<void>,
  (folderItems?: Array<TreeItem<DirectoryItem>>, newTotalCount?: number) => void,
  Array<TreeItem<DirectoryItem>>,
  boolean,
  boolean,
  () => void,
  number,
]

export default function useFetchFolder(
  directory: TreeItem<DirectoryItem>,
  dispatchKnownFolders: dispatchKnownFoldersFunction,
  getItemUrl: (item: DirectoryItem) => string,
): FetchFolderResult {
  const [items, setItems] = React.useState<Array<TreeItem<DirectoryItem>>>(directory.items)
  const [totalCount, setTotalCount] = React.useState<number>(directory.data.totalCount || 0)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<boolean>(false)
  const {safeSetTimeout} = useSafeTimeout()

  React.useEffect(() => {
    setItems(directory.items)
  }, [directory.items])

  React.useEffect(() => {
    directory.data.totalCount !== undefined && setTotalCount(directory.data.totalCount)
  }, [directory.data.totalCount])

  const clearError = React.useCallback(() => {
    setError(false)
  }, [])

  const incrementallyShowItems = React.useCallback(
    (folderItems?: Array<TreeItem<DirectoryItem>>, newTotalCount?: number) => {
      const newItems = folderItems || [...items]
      setItems(newItems.slice(0, 100))
      safeSetTimeout(() => {
        setItems(newItems)
        if (newTotalCount !== undefined) {
          setTotalCount(newTotalCount)
        }
      }, 1)
    },
    [items, safeSetTimeout],
  )

  const fetchFolder = React.useCallback(async () => {
    const contentUrl = getItemUrl(directory.data)
    const newKnownFolders = new Map()
    setError(false)
    setLoading(true)
    const start = Date.now()
    const response = await verifiedFetchJSON(`${contentUrl}?noancestors=1`)
    try {
      if (response.ok) {
        const folderPayload = await response.json()
        const folderItems = folderPayload.payload.tree.items.map((payloadItem: DirectoryItem) => {
          const treeItem = {
            items: [],
            data: {...payloadItem},
            autoExpand: payloadItem.contentType === 'directory' && folderPayload.payload.tree.items.length === 1,
          }
          newKnownFolders.set(payloadItem.path, treeItem)
          if (payloadItem.hasSimplifiedPath) {
            const topTreeItem = splitSimplifiedTreeItem(treeItem, payloadItem, newKnownFolders)
            return topTreeItem
          }
          return treeItem
        })
        dispatchKnownFolders({
          type: 'add',
          folders: newKnownFolders,
          processingTime: Date.now() - start,
        })
        directory.items = folderItems
        directory.data.totalCount = folderPayload.payload.tree.totalCount
        if (folderItems.length > 100) {
          incrementallyShowItems(folderItems, folderPayload.payload.tree.totalCount)
        } else {
          setItems(folderItems)
          setTotalCount(folderPayload.payload.tree.totalCount)
        }
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    }
    setLoading(false)
  }, [getItemUrl, directory, dispatchKnownFolders, incrementallyShowItems])

  return [fetchFolder, incrementallyShowItems, items, loading, error, clearError, totalCount]
}

export function splitSimplifiedTreeItem(
  treeItem: TreeItem<DirectoryItem>,
  payloadItem: DirectoryItem,
  knownFolders: Map<string, TreeItem<DirectoryItem>>,
): TreeItem<DirectoryItem> {
  treeItem.data.name = treeItem.data.name.slice(treeItem.data.name.lastIndexOf('/') + 1, treeItem.data.name.length)
  const topItemName = payloadItem.name.slice(0, payloadItem.name.lastIndexOf('/'))
  const hasSimplifiedPath = topItemName.indexOf('/') > -1
  const topItem = {
    path: payloadItem.path.slice(0, payloadItem.path.lastIndexOf('/')),
    contentType: payloadItem.contentType,
    name: topItemName,
    hasSimplifiedPath,
  }
  const topTreeItem = {
    items: [treeItem],
    data: topItem,
  }
  knownFolders.set(topItem.path, topTreeItem)
  if (hasSimplifiedPath) {
    return splitSimplifiedTreeItem(topTreeItem, {...topItem}, knownFolders)
  } else {
    return topTreeItem
  }
}
