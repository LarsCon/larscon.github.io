import { createContext, useContext, useState, useCallback } from 'react'

const TourContext = createContext(null)

export function TourProvider({ children }) {
  const [active, setActive] = useState(false)
  const [step, setStep] = useState(0)

  const startTour = useCallback(() => {
    setStep(0)
    setActive(true)
  }, [])

  const nextStep = useCallback(() => setStep(s => s + 1), [])

  const endTour = useCallback(() => {
    setActive(false)
    setStep(0)
  }, [])

  return (
    <TourContext.Provider value={{ active, step, startTour, nextStep, endTour }}>
      {children}
    </TourContext.Provider>
  )
}

export function useTour() {
  return useContext(TourContext)
}
