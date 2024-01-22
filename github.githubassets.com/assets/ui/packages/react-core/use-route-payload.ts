import {useCurrentRouteState} from './use-current-route-state'

/**
 * NOTE: This should be deprecated soon when we have a mechanism to pass the route payload directly as a prop to the
 * page components. This abstraction leads to implicit coupling (e.g., App components consuming the route payload) and
 * also won't make sense for Relay-based routes.
 */
export function useRoutePayload<T>(): T {
  const state = useCurrentRouteState<{type: 'loaded'; data: unknown}>()
  const data = (state && state.type === 'loaded' ? state.data : undefined) as {payload: unknown} | undefined

  return data?.payload as T
}
