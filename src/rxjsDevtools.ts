// @ts-nocheck
import DevToolsPlugin from 'rxjs-spy-devtools-plugin'
import { create } from 'rxjs-spy'

export const createRxjsDevtools = () => {
  if (process.env.NODE_ENV === 'development') {
    const spy = create()
    const devtoolsPlugin = new DevToolsPlugin(spy, {
      verbose: true,
    })
    spy.plug(devtoolsPlugin)

    // //We must teardown the spy if we're hot-reloading:
    if (module.hot) {
      if (module.hot) {
        module.hot.dispose(() => {
          spy.teardown()
        })
      }
    }
  }
}
