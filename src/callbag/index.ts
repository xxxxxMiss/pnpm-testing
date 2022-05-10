interface Sink {
  (type: 0 | 1 | 2, data?: any): void
}

interface Pipe {
  (arg: any): (input: Sink) => Sink
}

const pipe = (source, ...callbacks) =>
  callbacks.reduce((prev, cb) => cb(prev), source)

export const makeSink = () => {
  let timer: number
  const sink: Sink = (type, data) => {
    if (type === 0) {
      const talkback = data
      timer = window.setTimeout(() => talkback?.(2), 3000)
    }
    if (type === 1) {
      console.log('pass data', data)
    }
    if (type === 2) {
      clearTimeout(timer)
    }
  }
  return sink
}

export const sourceWithPushable: Sink = (type, data) => {
  if (type === 0) {
    const sink = data
    const handle = setInterval(() => {
      sink?.(1, null)
    })
    // sink?.(0, sink)
    const talkback: Sink = (t, d) => {
      if (t === 2) clearInterval(handle)
    }
    sink?.(0, talkback)
  }
}

// pushable(observable)
const interval = period => (start, sink) => {
  if (start !== 0) return
  let i = 0
  const id = setInterval(() => {
    sink(1, i++)
  }, period)
  sink(0, t => {
    if (t === 2) clearInterval(id)
  })
}

const forEach = operation => source => {
  let talkback
  source(0, (t, d) => {
    if (t === 0) talkback = d
    if (t === 1) operation(d)
    if (t === 1 || t === 0) talkback(1)
  })
}
pipe(
  interval(1000),
  forEach(v => console.log(v))
)

// let fn
// interval(1000)(0, (t, d) => {
//   console.log('t--', t, 'd: ', d)
//   if (t === 0) {
//     fn = d
//   }
//   setTimeout(() => {
//     fn(2)
//   }, 3000)
// })

const fromIter = iter => (start, sink) => {
  if (start !== 0) return
  sink(0, t => {
    if (t === 1) {
    }
  })
}
// fromIter([1, 2, 3])(0, (t, d) => {
//   console.log('----t---', t, 'd: ', d)
// })

export const sourceWithPullable: Sink = (start, sink) => {
  if (start != 0) return
  let i = 10
  const talkback: Sink = (t, d) => {
    if (t === 1) {
      if (i <= 20) {
        sink?.(1, i)
      } else {
        sink?.(2)
      }
    }
  }
  sink?.(0, talkback)
}

const multipleBy: Pipe = factor => inputSource => {
  return function outputSource(start, outputSink) {
    if (start != 0) return
    inputSource?.(0, (t, d) => {
      if (t === 1) {
        outputSink?.(1, d * factor)
      } else {
        outputSink(t, d)
      }
    })
  }
}

// const from = iter => (type, sink) => {
//   if (type != 0) return

//   if (Array.isArray(iter)) {
//     const len = iter.length
//     let inLoop = true
//     let i = 0
//     sink(0, t => {
//       if (i == len) return
//       if (type == 1) {
//         sink(1, { v: iter[i], i: i++, o: iter })
//       }
//       if (i == len && inLoop) {
//         inLoop = false
//         sink(2)
//       }
//       if (type == 2) {
//         sink(2)
//       }
//     })
//   }
// }

// const map = (callback, thisArg?) => source => (type, sink) => {
//   if ((type! = 0)) return

//   let i = 0
//   source(0, (t, d) => {
//     sink(t, t === 1 ? callback(thisArg, d.v, i++, d.o) : d)
//   })
// }

// const each = (callback, thisArg?) => source => {
//   let pullable
//   let i = 0

//   // 建立通信
//   source(0, (t, d) => {
//     // source 收到 listener 的 type 0 后，将内部的 sink 传出来给 listener 使用
//     if (t === 0) pullable = d
//     // 收到 source 返回数据，执行用户逻辑
//     if (t === 1) callback.call(thisArg, d, i++)
//     // 数据遍历完了，结束
//     if (t === 2) pullable = null

//     // 收到 0 或 1，开始消费 source
//     if (t !== 2) pullable(1)
//   })
// }

// const pipe = (source, ...callbacks) =>
//   callbacks.reduce((prev, cb) => cb(prev), source)

// const source = pipe(
//   from([3, 5, 8]),
//   map((n, i) => {
//     console.log('map')
//     return n * 2 + '-map-' + i
//   })
// )

// each((n, i) => console.log(n, i))(source)

const START = 0
const DATA = 1
const END = 2

// 接受一个 iter 作为入参，返回 source sink
// 这个 source sink 接受的第二个参数 payload 是个 sink，看清楚结构哦~
// payload 为 sink 原因是，你总得给 from operator 把数据传出去的机会吧，这里面都是用 sink 通信，那就传 sink 咯
const from = iter => (type, sink) => {
  // 如果 listener 不先传 0，source 没有nuan用
  if (type !== START) return

  // 偷懒简单实现，更通用的方式是利用 iterator
  if (Array.isArray(iter)) {
    const len = iter.length
    let inLoop = true
    let i = 0

    // 数据准备好了，既然是 sink 嘛，那还得先建立通信咯
    sink(START, t => {
      if (i === len) return
      // 静候 type 1 的到来，传出数据
      if (t === DATA) {
        sink(DATA, { v: iter[i], i: i++, o: iter })
        if (i === len && inLoop) {
          inLoop = false
          // 遍历完了断开通信
          sink(END)
        }
      }
      // listener 主动断开连接
      if (t === END) sink(END)
    })
  }

  // if (toString.call(source) === "[object Object]") {}
}

// 接受用户层面的 callback 和 this，这个大家比较熟悉
// 然后跟 from 一样接受先 source sink（即 from 的 iter 参数）作为 pullable 的数据源
// 当然最后自己也返回一个 sink，这个 sink 的第二个参数是个 sink，原因也和 from 一样，你得让我把处理完的数据传出去吧
const map = (callback, thisArg?) => source => (type, sink) => {
  if (type !== START) return
  let i = 0

  // 数据准备好了，与 source 建立通信
  source(START, (t, d) => {
    // 静候 type 1 的到来，执行用户层面的 callback 并传出
    sink(t, t === DATA ? callback.call(thisArg, d.v, i++, d.o) : d)
  })
}

// 接受用户层面的 callback 和 this
// 然后不用像 from 和 map 一样最后还得返回 sink 里套 sink，直接与 source 通信就行。因为自己又不需要把数据传出去
const each = (callback, thisArg?) => source => {
  let pullable
  let i = 0

  // 建立通信
  source(START, (t, d) => {
    // source 收到 listener 的 type 0 后，将内部的 sink 传出来给 listener 使用
    if (t === START) pullable = d
    // 收到 source 返回数据，执行用户逻辑
    if (t === DATA) callback.call(thisArg, d, i++)
    // 数据遍历完了，结束
    if (t === END) pullable = null

    // 收到 0 或 1，开始消费 source
    if (t !== END) pullable(DATA)
  })
}

const mymap = f => source => (type, sink) => {
  if (type != 0) return
  source(0, (t, d) => {
    sink(t, t === 1 ? f(d) : d)
  })
}

const source = pipe(
  from([3, 5, 8]),
  map((n, i) => n * 2 + '-map-' + i)
)

// each((n, i) => console.log(n, i))(source)

export default {}

interface Observer {
  next(x): void
  complete(): void
  error(e): void
}

let Subject = {
  _state: 0,
  _observers: [],
  add: function (observer) {
    // @ts-ignore
    this._observers.push(observer)
  },
  getState: function () {
    return this._state
  },
  setState: function (value) {
    this._state = value
    for (let i = 0; i < this._observers.length; i++) {
      // @ts-ignore
      this._observers[i].signal(this)
    }
  },
}

let Observer = {
  signal: function (subject) {
    let currentValue = subject.getState()
    console.log(currentValue)
  },
}

Subject.add(Observer)
Subject.setState(10)
//Output in console.log - 10
