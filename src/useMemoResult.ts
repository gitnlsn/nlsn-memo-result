import { isEqual } from "lodash"
import { useEffect, useMemo, useState } from "react"

/**
 * Native UseMemo triggers state update when result is equal, but when dependency array changes.
 * This implementation wont trigger state update if result is equal, preventing state update propagation.
 * Equality is implemented with isEqual from lodash.
 */
export const useMemoResult: typeof useMemo = (factory, deps) => {
  const [memo, setMemo] = useState(factory)

  useEffect(() => {
    setMemo((current) => {
      const possibleNewMemo = factory()

      if (!isEqual(current, possibleNewMemo)) {
        return possibleNewMemo
      }

      return current
    })
  }, [deps])

  return memo
}
