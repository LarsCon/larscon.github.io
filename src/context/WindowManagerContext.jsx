import { createContext, useContext, useReducer, useCallback } from 'react'

const WindowManagerContext = createContext(null)

const ACTIONS = {
  OPEN: 'OPEN',
  CLOSE: 'CLOSE',
  MINIMIZE: 'MINIMIZE',
  MAXIMIZE: 'MAXIMIZE',
  RESTORE: 'RESTORE',
  FOCUS: 'FOCUS',
  MOVE: 'MOVE',
  RESIZE: 'RESIZE',
  ANIMATE_MINIMIZE: 'ANIMATE_MINIMIZE',
  ANIMATION_COMPLETE: 'ANIMATION_COMPLETE',
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

const initialState = {
  windows: [],
  activeWindowId: null,
  nextZIndex: 1,
}

function windowReducer(state, action) {
  switch (action.type) {
    case ACTIONS.OPEN: {
      const existing = state.windows.find(w => w.appId === action.payload.appId)
      if (existing) {
        return {
          ...state,
          windows: state.windows.map(w =>
            w.id === existing.id
              ? { ...w, isMinimized: false, animState: null, zIndex: state.nextZIndex }
              : w
          ),
          activeWindowId: existing.id,
          nextZIndex: state.nextZIndex + 1,
        }
      }

      const id = generateId()
      const { appId, title, icon, defaultSize } = action.payload
      const offsetIndex = state.windows.length % 8
      const newWindow = {
        id,
        appId,
        title,
        icon,
        position: {
          x: 60 + offsetIndex * 30,
          y: 40 + offsetIndex * 30,
        },
        size: defaultSize || { width: 600, height: 400 },
        isMinimized: false,
        isMaximized: false,
        preMaximizeRect: null,
        animState: null,
        zIndex: state.nextZIndex,
      }

      return {
        ...state,
        windows: [...state.windows, newWindow],
        activeWindowId: id,
        nextZIndex: state.nextZIndex + 1,
      }
    }

    case ACTIONS.CLOSE: {
      const remaining = state.windows.filter(w => w.id !== action.payload.id)
      return {
        ...state,
        windows: remaining,
        activeWindowId:
          state.activeWindowId === action.payload.id
            ? (remaining.length > 0
                ? remaining.reduce((a, b) => (a.zIndex > b.zIndex ? a : b)).id
                : null)
            : state.activeWindowId,
      }
    }

    case ACTIONS.ANIMATE_MINIMIZE: {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id
            ? { ...w, animState: 'minimizing' }
            : w
        ),
      }
    }

    case ACTIONS.MINIMIZE: {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id
            ? { ...w, isMinimized: true, animState: null }
            : w
        ),
        activeWindowId:
          state.activeWindowId === action.payload.id
            ? (() => {
                const visible = state.windows.filter(
                  w => w.id !== action.payload.id && !w.isMinimized
                )
                return visible.length > 0
                  ? visible.reduce((a, b) => (a.zIndex > b.zIndex ? a : b)).id
                  : null
              })()
            : state.activeWindowId,
      }
    }

    case ACTIONS.MAXIMIZE: {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id
            ? {
                ...w,
                isMaximized: true,
                preMaximizeRect: { position: w.position, size: w.size },
                position: { x: 0, y: 0 },
                size: { width: window.innerWidth, height: window.innerHeight - 48 },
                zIndex: state.nextZIndex,
              }
            : w
        ),
        activeWindowId: action.payload.id,
        nextZIndex: state.nextZIndex + 1,
      }
    }

    case ACTIONS.RESTORE: {
      return {
        ...state,
        windows: state.windows.map(w => {
          if (w.id !== action.payload.id) return w
          if (w.animState === 'minimizing') {
            return { ...w, animState: null, zIndex: state.nextZIndex }
          }
          if (w.isMinimized) {
            return { ...w, isMinimized: false, animState: 'restoring', zIndex: state.nextZIndex }
          }
          if (w.isMaximized && w.preMaximizeRect) {
            return {
              ...w,
              isMaximized: false,
              position: w.preMaximizeRect.position,
              size: w.preMaximizeRect.size,
              preMaximizeRect: null,
              zIndex: state.nextZIndex,
            }
          }
          return { ...w, zIndex: state.nextZIndex }
        }),
        activeWindowId: action.payload.id,
        nextZIndex: state.nextZIndex + 1,
      }
    }

    case ACTIONS.ANIMATION_COMPLETE: {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id
            ? { ...w, animState: null }
            : w
        ),
      }
    }

    case ACTIONS.FOCUS: {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id
            ? { ...w, zIndex: state.nextZIndex }
            : w
        ),
        activeWindowId: action.payload.id,
        nextZIndex: state.nextZIndex + 1,
      }
    }

    case ACTIONS.MOVE: {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id
            ? { ...w, position: action.payload.position }
            : w
        ),
      }
    }

    case ACTIONS.RESIZE: {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id
            ? {
                ...w,
                size: action.payload.size,
                ...(action.payload.position && { position: action.payload.position }),
              }
            : w
        ),
      }
    }

    default:
      return state
  }
}

export function WindowManagerProvider({ children }) {
  const [state, dispatch] = useReducer(windowReducer, initialState)

  const openWindow = useCallback((appConfig) => {
    dispatch({ type: ACTIONS.OPEN, payload: appConfig })
  }, [])

  const closeWindow = useCallback((id) => {
    dispatch({ type: ACTIONS.CLOSE, payload: { id } })
  }, [])

  const minimizeWindow = useCallback((id) => {
    dispatch({ type: ACTIONS.MINIMIZE, payload: { id } })
  }, [])

  const animateMinimize = useCallback((id) => {
    dispatch({ type: ACTIONS.ANIMATE_MINIMIZE, payload: { id } })
  }, [])

  const maximizeWindow = useCallback((id) => {
    dispatch({ type: ACTIONS.MAXIMIZE, payload: { id } })
  }, [])

  const restoreWindow = useCallback((id) => {
    dispatch({ type: ACTIONS.RESTORE, payload: { id } })
  }, [])

  const focusWindow = useCallback((id) => {
    dispatch({ type: ACTIONS.FOCUS, payload: { id } })
  }, [])

  const moveWindow = useCallback((id, position) => {
    dispatch({ type: ACTIONS.MOVE, payload: { id, position } })
  }, [])

  const resizeWindow = useCallback((id, size, position) => {
    dispatch({ type: ACTIONS.RESIZE, payload: { id, size, position } })
  }, [])

  const animationComplete = useCallback((id) => {
    dispatch({ type: ACTIONS.ANIMATION_COMPLETE, payload: { id } })
  }, [])

  const value = {
    windows: state.windows,
    activeWindowId: state.activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    animateMinimize,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    moveWindow,
    resizeWindow,
    animationComplete,
  }

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  )
}

export { WindowManagerContext }

export function useWindowManager() {
  const ctx = useContext(WindowManagerContext)
  if (!ctx) throw new Error('useWindowManager must be used within WindowManagerProvider')
  return ctx
}
