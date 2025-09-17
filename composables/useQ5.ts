export const useQ5 = () => {
  const fetchList = () => {
    return new Promise<{ id: string }[]>((resolve, reject) => {
      setTimeout(() => {
        resolve([
          { id: '1' },
          { id: '2' },
          { id: '3' },
          { id: '4' },
          { id: '5' },
          { id: '6' },
          { id: '7' },
          { id: '8' },
          { id: '9' },
          { id: '10' },
          { id: '11' },
          { id: '12' },
          { id: '13' },
          { id: '14' },
          { id: '15' },
          { id: '16' },
          { id: '17' },
          { id: '18' },
          { id: '19' },
          { id: '20' },
        ])
      }, 1000)
    })
  }
  
  const fetchDetail = (id: string) => {
    const now = Date.now()
    console.log('start to fetch detail with id', id, 'at', now);
    return new Promise<{ id: string, name: string, ans: number }>((resolve, reject) => {
      setTimeout(async () => {
        // Use Web Worker for heavy calculation to prevent UI blocking
        const ans = await calculateHeavy(+id % 5 + 37)
        resolve({ id, name: `John Doe ${id}`, ans })
        console.log('fetch detail with id', id, 'done at', Date.now() - now);
      }, 3000 * Math.random())
    })
  }

  /**
   * Calculate heavy computation using Web Worker to prevent UI blocking
   */
  const calculateHeavy = (n: number): Promise<number> => {
    return new Promise((resolve, reject) => {
      const worker = new Worker('/heavy-calculation-worker.js')
      
      worker.postMessage({ id: Date.now(), n })
      
      worker.onmessage = (event) => {
        const { result } = event.data
        worker.terminate()
        resolve(result)
      }
      
      worker.onerror = (error) => {
        worker.terminate()
        reject(error)
      }
    })
  }

  /**
   * Original mock heavy function (kept for reference)
   * This is now handled by Web Worker to prevent UI blocking
   */
  const mockHeavy = (n: number): number => {
    if (n <= 1) return n;
    return mockHeavy(n - 1) + mockHeavy(n - 2);
  }

  return {
    fetchList,
    fetchDetail,
    mockHeavy,
    calculateHeavy
  }
}
