import Loader from './components/Loader'

import { LoaderProps } from './types'

function LoaderComponent(props: LoaderProps): JSX.Element {
  const { isLoading, component } = props

  return isLoading ? <Loader /> : <>{component}</>
}

export { Loader }

export default LoaderComponent
