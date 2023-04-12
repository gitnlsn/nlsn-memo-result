import { act, renderHook } from "@testing-library/react-hooks"
import { useEffect, useState } from "react"
import { useMemoResult } from "../src/useMemoResult"

describe("useMemoResult", () => {
  const sideEffect = jest.fn()

  type DataType = { id: number; name: string }

  const sampleData = [
    { id: 1, name: "name" },
    { id: 2, name: "name" },
    { id: 3, name: "name" },
  ] as DataType[]

  const processData = (item: DataType) => item.name

  const TrialHook = () => {
    const [data, setData] = useState<DataType[] | undefined>(undefined)

    const processedData = useMemoResult(
      () => data?.map(processData) ?? [],
      [data]
    )

    useEffect(() => {
      sideEffect(processedData)
    }, [processedData])

    return {
      data,
      processedData,
      setData,
    }
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("useMemo behaviour", () => {
    it("should keep useMemo behaviour", () => {
      const { result } = renderHook(() => TrialHook())

      expect(result.current.data).toBe(undefined)
      expect(result.current.processedData).toEqual([])

      act(() => {
        result.current.setData(sampleData)
      })
      expect(result.current.data).toEqual(sampleData)
      expect(result.current.processedData).toEqual(sampleData.map(processData))
    })

    it("should trigger initial sideEffect", () => {
      renderHook(() => TrialHook())

      expect(sideEffect).toHaveBeenCalledTimes(1)
      expect(sideEffect).toHaveBeenCalledWith([])
    })

    it("should trigger sideEffect when dependencies change", () => {
      const { result } = renderHook(() => TrialHook())
      sideEffect.mockClear()

      // Sets sample data
      act(() => {
        result.current.setData(sampleData)
      })

      expect(sideEffect).toHaveBeenCalledTimes(1)
      expect(sideEffect).toHaveBeenCalledWith(sampleData.map(processData))
    })

    it("should not trigger sideEffect when dependencies change to same reference", () => {
      const { result } = renderHook(() => TrialHook())

      act(() => {
        result.current.setData(sampleData)
      })

      // Sets same referenced data
      sideEffect.mockClear()
      act(() => {
        result.current.setData(sampleData)
      })

      expect(sideEffect).toHaveBeenCalledTimes(0)
    })
  })

  describe("prevent state update propagation is hook result doesnt change", () => {
    it("should not trigger sideEffect if hook result is the same", () => {
      const { result } = renderHook(() => TrialHook())

      // Sets sample data
      act(() => {
        result.current.setData(sampleData)
      })

      // Sets data whose processed result is the same
      sideEffect.mockClear()
      const newData = sampleData.map((item) => ({ ...item, id: item.id + 10 }))
      act(() => {
        result.current.setData(newData)
      })

      expect(sideEffect).toHaveBeenCalledTimes(0)
      sideEffect.mockClear()
    })
  })
})
