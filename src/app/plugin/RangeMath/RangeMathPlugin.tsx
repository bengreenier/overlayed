import React from "react"

// require call because our tsc compiler will complain otherwise
const rangeFit = require('range-fit')

/**
 * Example plugin with npm dependency
 */
export default class RangeMathPlugin extends React.Component<any, any> {
  constructor(props : any) {
    super(props)
  }

  public render() {
    return <h1>{rangeFit(5, 0, 10, 0, 100)}</h1>
  }
}