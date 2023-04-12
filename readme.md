[![Build](https://github.com/gitnlsn/nlsn-memo-result/actions/workflows/build.yml/badge.svg)](https://github.com/gitnlsn/nlsn-memo-result/actions/workflows/build.yml)
[![Tests](https://github.com/gitnlsn/nlsn-memo-result/actions/workflows/tests.yml/badge.svg)](https://github.com/gitnlsn/nlsn-memo-result/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/gitnlsn/nlsn-memo-result/branch/master/graph/badge.svg?token=mijoAGaDk9)](https://codecov.io/gh/gitnlsn/nlsn-memo-result)
[![npm version](https://badge.fury.io/js/nlsn-memo-result.svg)](https://badge.fury.io/js/nlsn-memo-result)

# Description

React hook `useMemo` will propagate update event if the return value changes, even by refenrece. In some cases, this update event triggers UI events and is undesired.

This hook prevents the update if the return value is equal to the previous, with the cost of deep equality comparison.

# Usage

Install `nlsn-memo-result` with npm or yarn.

```bash
# npm
npm install nlsn-memo-result

# yarn
yarn add nlsn-memo-result
```

Then you can use `useMemoResult` with the following syntax.

```ts
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
    })
  })
})
```
