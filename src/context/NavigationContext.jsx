import { createContext, useContext, useReducer, useCallback } from 'react'

const NavigationContext = createContext(null)

const ACTIONS = {
  PUSH: 'PUSH',
  POP: 'POP',
  REPLACE: 'REPLACE',
  RESET: 'RESET',
}

function navReducer(state, action) {
  switch (action.type) {
    case ACTIONS.PUSH:
      return {
        ...state,
        stack: [...state.stack, { component: action.payload.component, props: action.payload.props || {} }],
      }
    case ACTIONS.POP:
      if (state.stack.length <= 1) return state
      return {
        ...state,
        stack: state.stack.slice(0, -1),
      }
    case ACTIONS.REPLACE:
      return {
        ...state,
        stack: [
          ...state.stack.slice(0, -1),
          { component: action.payload.component, props: action.payload.props || {} },
        ],
      }
    case ACTIONS.RESET:
      return {
        ...state,
        stack: [state.stack[0]],
      }
    default:
      return state
  }
}

export function NavigationProvider({ rootComponent: RootComponent, rootProps, children }) {
  const [state, dispatch] = useReducer(navReducer, {
    stack: [{ component: RootComponent, props: rootProps || {} }],
  })

  const push = useCallback((component, props) => {
    dispatch({ type: ACTIONS.PUSH, payload: { component, props } })
  }, [])

  const pop = useCallback(() => {
    dispatch({ type: ACTIONS.POP })
  }, [])

  const replace = useCallback((component, props) => {
    dispatch({ type: ACTIONS.REPLACE, payload: { component, props } })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: ACTIONS.RESET })
  }, [])

  const currentEntry = state.stack[state.stack.length - 1]
  const canGoBack = state.stack.length > 1
  const depth = state.stack.length

  const value = {
    push,
    pop,
    replace,
    reset,
    canGoBack,
    depth,
    currentEntry,
    stack: state.stack,
  }

  if (typeof children === 'function') {
    return (
      <NavigationContext.Provider value={value}>
        {children(value)}
      </NavigationContext.Provider>
    )
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

export function NavigationView() {
  const { currentEntry } = useNavigation()
  const Component = currentEntry.component
  return <Component {...currentEntry.props} />
}

export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider')
  return ctx
}
